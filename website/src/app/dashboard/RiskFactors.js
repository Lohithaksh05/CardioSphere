import "./styles.css"

export default function RiskFactors({ factors }) {

    return (
        <div className="risk-factor">
            <header>Risk Factors</header>
            {console.log(factors)}
            <ul className="factor">
                {factors.map((factor, index) => {
                    return (
                        <li key={index}>
                            {index+1}. {factor}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}