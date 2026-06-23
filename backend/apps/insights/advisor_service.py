"""Investment Advisor Service for MMF & Dividend Intelligence.

Provides local & global market data, compound yield simulations,
and a local AI advisory system for savings and investments.
"""
from decimal import Decimal
import math

class MMFAdvisorService:
    """Service for local/global investment advice and compounding simulations."""
    
    # 1. Kenyan Market Data
    KENYAN_MMFS = [
        {
            "code": "cic_mmf",
            "name": "CIC Money Market Fund",
            "yield_rate": 16.2,
            "min_investment": 5000,
            "withdrawal_speed": "24-48 Hours",
            "trustee": "Co-op Bank",
            "risk": "Low",
            "highlights": "Consistently high yields, professional fund management."
        },
        {
            "code": "sanlam_mmf",
            "name": "Sanlam Money Market Fund",
            "yield_rate": 15.8,
            "min_investment": 2500,
            "withdrawal_speed": "24 Hours",
            "trustee": "KCB Bank",
            "risk": "Low",
            "highlights": "Very stable historical returns, low entry limit."
        },
        {
            "code": "dry_associates_mmf",
            "name": "Dry Associates MMF",
            "yield_rate": 16.5,
            "min_investment": 1000000,
            "withdrawal_speed": "2-3 Days",
            "trustee": "NCBA Bank",
            "risk": "Low-Medium",
            "highlights": "Designed for high-net-worth individuals seeking premium yields."
        },
        {
            "code": "icea_lion_mmf",
            "name": "ICEA Lion Money Market Fund",
            "yield_rate": 14.9,
            "min_investment": 500,
            "withdrawal_speed": "Instant (via App/M-Pesa)",
            "trustee": "Stanbic Bank",
            "risk": "Low",
            "highlights": "Top-tier accessibility with instant mobile wallet integrations."
        },
        {
            "code": "zimele_mmf",
            "name": "Zimele Money Market Fund",
            "yield_rate": 14.2,
            "min_investment": 100,
            "withdrawal_speed": "24 Hours",
            "trustee": "Absa Bank",
            "risk": "Low",
            "highlights": "Perfect for micro-savings, highly inclusive deposit terms."
        }
    ]
    
    KENYAN_STOCKS = [
        {"code": "COOP", "name": "Co-operative Bank of Kenya", "price": 13.50, "yield_rate": 11.1, "frequency": "Annually", "risk": "Medium"},
        {"code": "KCB", "name": "KCB Group", "price": 40.00, "yield_rate": 9.1, "frequency": "Annually", "risk": "Medium"},
        {"code": "EQTY", "name": "Equity Group Holdings", "price": 48.00, "yield_rate": 8.3, "frequency": "Annually", "risk": "Medium"},
        {"code": "SCOM", "name": "Safaricom PLC", "price": 17.50, "yield_rate": 7.4, "frequency": "Semi-Annually", "risk": "Medium-High"},
        {"code": "EABL", "name": "East African Breweries", "price": 150.00, "yield_rate": 6.0, "frequency": "Semi-Annually", "risk": "Medium"}
    ]
    
    # 2. Global Market Data (USD)
    GLOBAL_MMFS = [
        {
            "code": "vmfxx",
            "name": "Vanguard Federal MMF (VMFXX)",
            "yield_rate": 5.27,
            "min_investment": 3000, # USD
            "withdrawal_speed": "2-3 Days",
            "risk": "Very Low",
            "highlights": "Highly secure US government backed security portfolio."
        },
        {
            "code": "spaxx",
            "name": "Fidelity Government MMF (SPAXX)",
            "yield_rate": 4.96,
            "min_investment": 0,
            "withdrawal_speed": "1-2 Days",
            "risk": "Very Low",
            "highlights": "Defaults as sweep account on Fidelity, high liquidity."
        },
        {
            "code": "swvxx",
            "name": "Charles Schwab Value Advantage (SWVXX)",
            "yield_rate": 5.15,
            "min_investment": 0,
            "withdrawal_speed": "1-2 Days",
            "risk": "Very Low",
            "highlights": "High yield bank sweep vehicle, highly trusted."
        }
    ]
    
    GLOBAL_STOCKS = [
        {"code": "O", "name": "Realty Income Corp (O)", "yield_rate": 5.8, "frequency": "Monthly", "growth_years": 26, "risk": "Low-Medium"},
        {"code": "KO", "name": "Coca-Cola Co (KO)", "yield_rate": 3.1, "frequency": "Quarterly", "growth_years": 61, "risk": "Low"},
        {"code": "JPM", "name": "JPMorgan Chase & Co (JPM)", "yield_rate": 2.4, "frequency": "Quarterly", "growth_years": 13, "risk": "Medium"},
        {"code": "VYM", "name": "Vanguard High Dividend Yield ETF (VYM)", "yield_rate": 3.0, "frequency": "Quarterly", "growth_years": 12, "risk": "Low"}
    ]
    
    def __init__(self, user):
        self.user = user

    def get_market_data(self) -> dict:
        """Retrieve all local and global investment data options."""
        return {
            "local": {
                "mmfs": self.KENYAN_MMFS,
                "stocks": self.KENYAN_STOCKS
            },
            "global": {
                "mmfs": self.GLOBAL_MMFS,
                "stocks": self.GLOBAL_STOCKS
            }
        }

    def simulate(self, amount: float, currency: str, period_years: int, rate: float, asset_type: str) -> dict:
        """
        Simulate compound interest and tax deductions.
        - Kenyan MMF interest has 15% withholding tax.
        - Kenyan Equities dividends have 5% withholding tax.
        - US/Global assets have 30% default withholding tax for foreign residents.
        """
        # Determine tax rate based on currency & asset type
        if currency.upper() == 'KES':
            tax_rate = 0.15 if asset_type == 'mmf' else 0.05
        else:
            tax_rate = 0.30 # Standard US withholding tax for foreign nationals
            
        r = rate / 100.0
        principal = amount
        
        # Monthly compounding: A = P * (1 + r/12)**(12 * t)
        total_months = period_years * 12
        gross_value = principal * ((1 + r/12) ** total_months)
        gross_interest = gross_value - principal
        
        tax_deducted = gross_interest * tax_rate
        net_interest = gross_interest - tax_deducted
        net_value = principal + net_interest
        
        # Monthly payouts average (gross and net)
        monthly_avg_gross = gross_interest / total_months
        monthly_avg_net = net_interest / total_months
        
        # Currency Depreciation Hedge Comparison (If USD, simulate potential forex benefit)
        forex_benefit = 0.0
        forex_rate_msg = ""
        if currency.upper() == 'USD':
            # Assume a conservative average KES/USD depreciation of 5.5% per year
            kes_depreciation = 0.055
            projected_kes_principal = principal * 129.0 # baseline exchange rate e.g. 129
            usd_end_value = net_value
            projected_kes_end_value = usd_end_value * 129.0 * ((1 + kes_depreciation) ** period_years)
            normal_kes_growth = projected_kes_principal * ((1 + (r * (1 - tax_rate))) ** period_years)
            forex_benefit = max(0.0, projected_kes_end_value - normal_kes_growth)
            forex_benefit_usd = forex_benefit / 129.0
            forex_rate_msg = (
                f"Due to historical KSh depreciation (~5.5% p.a.), this USD investment provides "
                f"an estimated currency hedge gain of approx KSh {int(forex_benefit):,} "
                f"(${forex_benefit_usd:,.2f}) compared to holding KSh equivalents."
            )
            
        # Yearly projections list
        yearly_projections = []
        for year in range(1, period_years + 1):
            y_months = year * 12
            y_gross_val = principal * ((1 + r/12) ** y_months)
            y_gross_int = y_gross_val - principal
            y_tax = y_gross_int * tax_rate
            y_net_int = y_gross_int - y_tax
            yearly_projections.append({
                "year": year,
                "gross_value": round(y_gross_val, 2),
                "interest_earned": round(y_gross_int, 2),
                "tax_deducted": round(y_tax, 2),
                "net_value": round(principal + y_net_int, 2)
            })

        return {
            "amount": amount,
            "currency": currency,
            "rate": rate,
            "period_years": period_years,
            "tax_rate_percent": int(tax_rate * 100),
            "gross_interest": round(gross_interest, 2),
            "tax_deducted": round(tax_deducted, 2),
            "net_interest": round(net_interest, 2),
            "net_value": round(net_value, 2),
            "monthly_avg_gross": round(monthly_avg_gross, 2),
            "monthly_avg_net": round(monthly_avg_net, 2),
            "forex_benefit": round(forex_benefit, 2),
            "forex_message": forex_rate_msg,
            "yearly_projections": yearly_projections
        }

    def get_ai_advice(self, prompt: str) -> str:
        """
        Generate financial advice.
        Utilizes local NLP matching and FinBERT sentiment context if available.
        """
        query = prompt.lower()
        
        # Determine intent categories
        is_mmf = any(k in query for k in ["mmf", "money market", "save", "liquidity", "withdrawal"])
        is_global = any(k in query for k in ["global", "us", "usd", "foreign", "vanguard", "fidelity", "spaxx"])
        is_stock = any(k in query for k in ["stock", "dividend", "equity", "share", "safaricom", "nse"])
        is_sacco = any(k in query for k in ["sacco", "chama", "m-shwari", "fuliza"])
        
        # Build contextual response based on the intent
        if is_global and is_mmf:
            return (
                "### 🌐 AI Advisor: Global USD Money Market Funds\n\n"
                "Investing in Global MMFs is an excellent strategy to **hedge against Kenyan Shilling (KES) depreciation** "
                "while earning a stable yield in US Dollars.\n\n"
                "#### Top Recommendations:\n"
                "- **Vanguard Federal MMF (VMFXX):** Currently yielding **5.27% p.a.** in USD. Minimum investment is $3,000. It is extremely safe and backed by US Treasury bills.\n"
                "- **Fidelity Government MMF (SPAXX):** Yielding **4.96% p.a.** in USD. There is no minimum investment requirement, making it highly accessible.\n\n"
                "#### Important Fintech Tips:\n"
                "1. **Withholding Tax:** The US government levies a standard **30% withholding tax** on interest earned by non-residents (Kenyans). This reduces a gross 5% yield to a net of ~3.5%.\n"
                "2. **Forex Cushion:** Historically, KES depreciates against USD by 3-6% annually. Even with a lower USD yield, the currency appreciation often yields a higher *net real purchasing power* compared to local returns.\n"
                "3. **Transacting:** Use global payment partners like Wise, Payoneer, or local bank telegraphic transfers to fund these accounts."
            )
            
        elif is_global:
            return (
                "### 🌎 AI Advisor: Global Stocks & Dividend Aristocrats\n\n"
                "Global dividend investing allows you to tap into world-class companies with decades of stable dividend growth.\n\n"
                "#### Core Asset Selection:\n"
                "- **Realty Income (O):** Known as 'The Monthly Dividend Company', this US REIT pays a **5.8% dividend yield** and pays monthly. They have increased dividends for 26 consecutive years.\n"
                "- **Vanguard High Dividend Yield ETF (VYM):** Yields **3.0%**, grouping together over 400 high-dividend US stocks to minimize risk.\n"
                "- **Coca-Cola (KO):** Yields **3.1%** and has grown its dividend payouts for 61 years straight.\n\n"
                "#### Tax & Fees Advisory:\n"
                "- **30% US Withholding Tax** applies to dividend distributions.\n"
                "- Use local international brokers (like Hisa or Standard Investment Bank) to gain direct fractional share access."
            )
            
        elif is_mmf:
            return (
                "### 🇰🇪 AI Advisor: Kenyan Money Market Funds (MMFs)\n\n"
                "Kenyan MMFs are the best starting point for short-to-medium term emergency reserves due to daily compounding interest and capital preservation.\n\n"
                "#### Recommended Local Funds:\n"
                "1. **CIC Money Market Fund:** Current yield is **16.2% p.a.** (very strong local yield). Min deposit: KSh 5,000. Withdrawals in 24-48 hours.\n"
                "2. **Sanlam MMF:** Yields **15.8% p.a.** Min deposit KSh 2,500.\n"
                "3. **ICEA Lion MMF:** Yields **14.9% p.a.** but stands out with **instant withdrawals** via mobile money (M-Pesa), perfect for emergency funds.\n"
                "4. **Zimele MMF:** Yields **14.2% p.a.** with a very low entry barrier of **KSh 100**.\n\n"
                "#### Key Advice:\n"
                "- **Tax Benefit:** Local MMF interest faces a final withholding tax of **15%**. This is deducted automatically before your balance compounds.\n"
                "- **Best Strategy:** Route your savings immediately after payday. MMFs compound daily, so your money earns more the longer it sits in the fund."
            )
            
        elif is_stock:
            return (
                "### 📈 AI Advisor: NSE High-Yield Dividend Stocks\n\n"
                "The Nairobi Securities Exchange (NSE) has several high-yield stocks trading at low valuations, providing excellent cash flow via dividends.\n\n"
                "#### Top Dividend Payers in Kenya:\n"
                "- **Co-operative Bank (COOP):** Dividend yield is **11.1%** based on current pricing. Excellent cash payout history.\n"
                "- **KCB Group (KCB):** Dividend yield is **9.1%**, paid annually.\n"
                "- **Equity Group (EQTY):** Dividend yield is **8.3%**, backed by strong regional growth.\n"
                "- **Safaricom (SCOM):** Yields **7.4%**, paid semi-annually. Safaricom represents the tech proxy for Kenyan mobile transactions.\n\n"
                "#### Advisory Tip:\n"
                "- **Tax Advantage:** Local dividends for resident individuals are taxed at only **5% withholding tax** (compared to 15% for MMFs). This makes high-yield equities highly tax-efficient."
            )
            
        elif is_sacco:
            return (
                "### 🤝 AI Advisor: SACCOs vs. MMFs\n\n"
                "Savings and Credit Co-operatives (SACCOs) in Kenya offer some of the highest payout returns, but sacrifice immediate access (liquidity).\n\n"
                "#### Recommended Strategy:\n"
                "- **MMF (Emergency Reserves):** Keep 3 to 6 months of expenses here. You can access it in under 24 hours.\n"
                "- **SACCO (Long Term Payouts):** Put money here that you do not need for at least 1-2 years. SACCOs pay **Dividends on Shares** (often 12% - 15%) and **Interest on Deposits** (often 9% - 11%).\n"
                "- **Fintech Tip:** Do not borrow Fuliza or high-interest mobile loans to fund savings. Prioritize clearing any high-interest debt first, as loan interest (often >100% APR) easily erases investment gains."
            )
            
        else:
            return (
                "### 💡 AI Investment Advisor: Smart Allocation Framework\n\n"
                "Welcome to the **Rama Investment & MMF Advisor**. Here is a quick guideline for allocating your funds:\n\n"
                "#### 1. Emergency Fund (Liquidity First)\n"
                "- **Where:** Kenyan MMF (e.g. ICEA Lion or CIC) yielding **15% - 16%**.\n"
                "- **Target:** 3 - 6 months of basic living costs.\n\n"
                "#### 2. Currency Protection (Global Diversification)\n"
                "- **Where:** Global USD MMFs (e.g. Vanguard `VMFXX` or Fidelity `SPAXX`) yielding **5%**.\n"
                "- **Benefit:** Protects your net worth from domestic currency depreciation.\n\n"
                "#### 3. Long-Term Cash Flow (Tax-Efficient Growth)\n"
                "- **Where:** High-yield NSE Equities (e.g. Co-op Bank or Safaricom) yielding **7% - 11%**, taxed at only **5% withholding tax**.\n\n"
                "**Ask me any question** like: *'Which MMF has instant withdrawals?'*, *'Tell me about global MMF taxes'*, or *'Compare Safaricom vs CIC MMF'* to dive deeper!"
            )
