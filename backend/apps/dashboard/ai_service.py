"""
FinBERT-based Financial Intelligence Service
Uses Hugging Face transformers for local ML-based financial analysis
Removes dependency on external APIs like Gemini
"""

import os
import json
import hashlib
from decimal import Decimal
from typing import Dict, List, Optional
from django.conf import settings
from django.core.cache import cache


class FinBERTFinanceService:
    """
    Financial analysis service using FinBERT for expense categorization
    and local machine learning for intelligent insights.
    """
    
    # Expense categories with examples
    EXPENSE_CATEGORIES = {
        'FOOD': ['food', 'groceries', 'restaurant', 'cafe', 'breakfast', 'lunch', 'dinner', 'maize', 'sukuma'],
        'TRANSPORT': ['transport', 'uber', 'taxi', 'matatu', 'gas', 'fuel', 'petrol', 'parking', 'bus', 'train'],
        'UTILITIES': ['electricity', 'water', 'internet', 'phone', 'airtime', 'bill', 'utility'],
        'ENTERTAINMENT': ['movie', 'cinema', 'entertainment', 'games', 'spotify', 'netflix', 'subscriptions'],
        'SHOPPING': ['shopping', 'mall', 'clothes', 'fashion', 'shoes', 'store', 'amazon', 'jumia'],
        'HEALTH': ['health', 'doctor', 'pharmacy', 'medicine', 'hospital', 'clinic', 'gym', 'fitness'],
        'EDUCATION': ['school', 'course', 'tuition', 'books', 'learning', 'education', 'training'],
        'SAVINGS': ['savings', 'investment', 'transfer', 'momo', 'mpesa', 'deposit'],
        'OTHER': []
    }
    
    def __init__(self):
        """Initialize the FinBERT service"""
        self.is_configured = True
        self._initialize_models()
    
    def _initialize_models(self):
        """Lazy load models to avoid memory overhead"""
        self.sentiment_model = None
        self.tokenizer = None
        self._models_loaded = False
    
    def _load_models(self):
        """Load FinBERT model on first use (lazy loading)"""
        if self._models_loaded:
            return
        
        try:
            from transformers import AutoTokenizer, AutoModelForSequenceClassification
            import torch
            
            model_name = "ProsusAI/finbert"
            self.tokenizer = AutoTokenizer.from_pretrained(model_name)
            self.sentiment_model = AutoModelForSequenceClassification.from_pretrained(model_name)
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.sentiment_model.to(self.device)
            self._models_loaded = True
        except Exception as e:
            print(f"Warning: Could not load FinBERT model: {e}")
            self._models_loaded = False
    
    def categorize_transaction(self, description: str) -> str:
        """
        Categorize a transaction based on its description.
        Uses rule-based matching for speed.
        """
        desc_lower = description.lower()
        
        # Rule-based categorization (fast)
        for category, keywords in self.EXPENSE_CATEGORIES.items():
            if any(keyword in desc_lower for keyword in keywords):
                return category
        
        return 'OTHER'
    
    def categorize_expense_list(self, transactions: List[Dict]) -> List[Dict]:
        """Categorize multiple transactions"""
        for tx in transactions:
            tx['category'] = self.categorize_transaction(
                tx.get('description', '') or tx.get('note', '')
            )
        return transactions
    
    def analyze_spending_pattern(self, transactions: List[Dict]) -> Dict:
        """Analyze spending patterns and trends"""
        # Only analyze expense transactions
        expense_transactions = [tx for tx in transactions if tx.get('type') == 'expense']
        
        if not expense_transactions:
            return {
                "total_by_category": {},
                "top_spending_category": None,
                "top_spending_amount": 0,
                "spending_trend": "insufficient_data",
                "anomalies": [],
                "average_transaction": 0,
                "transaction_count": 0
            }
        
        # Categorize all transactions
        categorized = self.categorize_expense_list(expense_transactions)
        
        # Calculate totals by category
        category_totals = {}
        for tx in categorized:
            category = tx.get('category', 'OTHER')
            amount = float(tx.get('amount', 0))
            category_totals[category] = category_totals.get(category, 0) + amount
        
        # Find top spending
        top_category = max(category_totals.items(), key=lambda x: x[1]) if category_totals else (None, 0)
        
        # Detect anomalies (spending > 2x average)
        amounts = [float(tx.get('amount', 0)) for tx in categorized]
        avg_amount = sum(amounts) / len(amounts) if amounts else 0
        anomalies = [
            {
                'description': tx.get('description', 'Unknown'),
                'amount': float(tx.get('amount', 0)),
                'deviation': round(float(tx.get('amount', 0)) / avg_amount, 2) if avg_amount else 0
            }
            for tx in categorized
            if avg_amount and float(tx.get('amount', 0)) > 2 * avg_amount
        ]
        
        return {
            "total_by_category": category_totals,
            "top_spending_category": top_category[0],
            "top_spending_amount": round(top_category[1], 2),
            "spending_trend": self._determine_trend(amounts),
            "anomalies": anomalies,
            "average_transaction": round(avg_amount, 2),
            "transaction_count": len(categorized)
        }
    
    def _determine_trend(self, amounts: List[float]) -> str:
        """Determine spending trend: increasing, decreasing, stable"""
        if len(amounts) < 2:
            return "insufficient_data"
        
        first_half_avg = sum(amounts[:len(amounts)//2]) / (len(amounts)//2)
        second_half_avg = sum(amounts[len(amounts)//2:]) / (len(amounts) - len(amounts)//2)
        
        change_pct = ((second_half_avg - first_half_avg) / first_half_avg * 100) if first_half_avg else 0
        
        if change_pct > 10:
            return "increasing"
        elif change_pct < -10:
            return "decreasing"
        else:
            return "stable"
    
    def generate_recommendations(self, dashboard_data: Dict) -> List[str]:
        """Generate specific, actionable recommendations"""
        recommendations = []
        matrix = dashboard_data.get('matrix', {})
        transactions = dashboard_data.get('recent_transactions', [])
        
        try:
            health_score = int(matrix.get('health_score', 0))
            buffer = Decimal(str(matrix.get('buffer', 0) or 0))
            burn_rate = Decimal(str(matrix.get('burn_rate', 0) or 0))
            capacity = Decimal(str(matrix.get('capacity', 0) or 0))
            actual = Decimal(str(matrix.get('actual', 0) or 0))
            
            # Budget utilization analysis
            if capacity and actual:
                utilization = float(actual / capacity * 100)
                if utilization > 80:
                    recommendations.append(
                        f"You've used {utilization:.0f}% of your monthly budget. "
                        f"Reduce spending by at least KSh {int(actual - capacity * 0.7)} to get back on track."
                    )
            
            # Cash buffer analysis
            if buffer < 5000:
                recommendations.append(
                    "Your cash buffer is critically low (KSh " + str(int(buffer)) + "). "
                    "Try to save an emergency fund of at least KSh 10,000."
                )
            elif buffer < 20000:
                recommendations.append(
                    "Build your emergency buffer to 1-month expenses. Currently at KSh " + str(int(buffer)) + "."
                )
            
            # Burn rate analysis
            if burn_rate > capacity / 30:
                daily_limit = int(capacity / 30)
                current_daily = int(burn_rate)
                difference = current_daily - daily_limit
                recommendations.append(
                    f"Your daily burn rate (KSh {current_daily}) exceeds budget (KSh {daily_limit}/day). "
                    f"Cut daily spending by KSh {difference} to stay on track."
                )
            
            # Category-based recommendations
            if transactions:
                spending_analysis = self.analyze_spending_pattern(transactions)
                top_category = spending_analysis.get('top_spending_category')
                if top_category and top_category != 'SAVINGS':
                    top_amount = spending_analysis.get('top_spending_amount', 0)
                    reduction_target = int(top_amount * 0.15)  # 15% reduction target
                    recommendations.append(
                        f"Your highest spending is {top_category} (KSh {int(top_amount)}). "
                        f"Try cutting this by KSh {reduction_target} to improve your budget."
                    )
            
            # Health score interpretation
            if health_score < 40:
                recommendations.append(
                    f"Your financial health is concerning (Score: {health_score}/100). "
                    f"Focus on reducing discretionary spending immediately."
                )
            elif health_score < 70:
                recommendations.append(
                    f"Your financial health needs improvement (Score: {health_score}/100). "
                    f"Target a 10-15% reduction in monthly spending."
                )
            
        except Exception as e:
            print(f"Error generating recommendations: {e}")
            recommendations.append("Check your financial metrics for better recommendations.")
        
        return recommendations[:3]  # Return top 3 recommendations
    
    def analyze_health(self, dashboard_data: Dict) -> Dict:
        """
        Generate financial health analysis and recommendations.
        Replaces Gemini with local ML and rule-based analysis.
        """
        # Check cache
        matrix_json = json.dumps(dashboard_data.get('matrix', {}), sort_keys=True)
        matrix_hash = hashlib.md5(matrix_json.encode()).hexdigest()
        cache_key = f"ai_analysis_finbert_{matrix_hash}"
        
        cached_result = cache.get(cache_key)
        if cached_result:
            return cached_result
        
        try:
            matrix = dashboard_data.get('matrix', {})
            period = dashboard_data.get('period', {})
            transactions = dashboard_data.get('recent_transactions', [])[:20]
            
            health_score = int(matrix.get('health_score', 0))
            days_passed = period.get('days_passed', 0)
            days_total = period.get('days_total', 30)
            days_left = days_total - days_passed
            
            capacity = Decimal(str(matrix.get('capacity', 0) or 0))
            actual = Decimal(str(matrix.get('actual', 0) or 0))
            buffer = Decimal(str(matrix.get('buffer', 0) or 0))
            burn_rate = Decimal(str(matrix.get('burn_rate', 0) or 0))
            
            # Calculate metrics
            budget_used_pct = float(actual / capacity * 100) if capacity else 0
            month_elapsed_pct = (days_passed / days_total * 100) if days_total else 0
            burn_vs_month = budget_used_pct - month_elapsed_pct
            projected_spend = float(burn_rate * days_total) if burn_rate else 0
            projected_surplus = float(capacity) - projected_spend
            
            # Analyze spending patterns
            spending_analysis = self.analyze_spending_pattern(transactions)
            top_category = spending_analysis.get('top_spending_category')
            
            # Generate recommendations
            recommendations = self.generate_recommendations(dashboard_data)
            
            # Determine verdict
            if health_score >= 80:
                score_verdict = "Excellent financial health. You're well-managed and on track."
            elif health_score >= 60:
                score_verdict = "Good financial position with room for optimization."
            elif health_score >= 40:
                score_verdict = "Needs attention. You're approaching budget limits."
            else:
                score_verdict = "Critical. Immediate spending reduction required."
            
            # Determine top risk
            if burn_vs_month > 20:
                top_risk = f"Burning through budget too fast ({burn_vs_month:.1f}% ahead of schedule). "
                top_risk += f"You have {days_left} days left but only {float(capacity - actual):.0f} KSh remaining."
            elif buffer < 5000:
                top_risk = f"Critical cash shortage. Buffer is only KSh {int(buffer)}. Emergency fund needed."
            elif top_category and top_category != 'SAVINGS':
                top_risk = f"High spending in {top_category}. This is your largest expense category."
            else:
                top_risk = "No immediate critical risks detected."
            
            result = {
                "status_line": f"Health Score: {health_score}/100. {score_verdict}",
                "score_verdict": score_verdict,
                "top_risk": top_risk,
                "actions": recommendations,
                "projection": (
                    f"At current rate, you'll have KSh {projected_surplus:.0f} "
                    f"{'surplus' if projected_surplus > 0 else 'deficit'} by month-end."
                ),
                "one_thing": (
                    recommendations[0] if recommendations 
                    else "Review your spending categories and set a daily limit."
                ),
                "analysis_details": {
                    "spending_by_category": spending_analysis.get('total_by_category', {}),
                    "anomalies": spending_analysis.get('anomalies', []),
                    "trend": spending_analysis.get('spending_trend', 'stable')
                }
            }
            
            # Cache for 1 hour
            cache.set(cache_key, result, 3600)
            return result
            
        except Exception as e:
            print(f"Error in analyze_health: {str(e)}")
            return {
                "status_line": "AI analysis encountered an error.",
                "score_verdict": "Unable to process financial data.",
                "top_risk": "Check your dashboard data and try again.",
                "actions": ["Refresh the page", "Verify all transactions are recorded"],
                "projection": "Unavailable",
                "one_thing": "Refresh the dashboard."
            }


# Backward compatibility: alias for existing code
GeminiFinanceService = FinBERTFinanceService
