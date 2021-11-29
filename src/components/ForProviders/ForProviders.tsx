import {Container} from "react-bootstrap/esm/index";
import styles from "./ForProviders.module.scss";

function ForProviders() {
    return (
        <Container className={styles['for-providers-container']}>
            <h4>About the Calculator</h4>
            <p>
                This calculator estimates a person’s 10-year risk of cardiovascular death, heart attack, or stroke
                derived from the SMART-REACH model. The calculator should only be used in patients with established
                cardiovascular disease including peripheral arterial disease, ischemic cerebrovascular disease, and
                coronary artery disease. Wethank the authors of the SMART-REACH tool for their permission to use their
                equations.
            </p>
            <h6>The full reference for the model is below:</h6>
            <p>
                Kaasenbrood L, Bhatt DL, Dorresteijn JAN, Wilson PWF, D'Agostino RB Sr, Massaro JM, van der
                Graaf Y,
                Cramer MJM, Kappelle LJ, de Borst GJ, Steg PG, Visseren FLJ. Estimated Life Expectancy Without
                Recurrent
                Cardiovascular Events in Patients WithVascular Disease: The SMART-REACH Model. J Am Heart Assoc.
                2018
                Aug 21;7(16):e009217. doi: 10.1161/JAHA.118.009217. PMID: 30369323
            </p>

            <h4>Estimated Risk Reductions</h4>
            <p>
                Relative risk reductions from clinical trials are used to estimate the impact of current therapies on
                cardiovascular risk, and to simulate the impact of additional therapies. The impact of statin therapy is
                based on the estimated LDL-C lowering onstatin. See below for additional details.
            </p>
            <p>
                Clinical judgement should be used to determine individual patient eligibility for eachtherapy. The
                presence of a treatment option in the calculator should not be interpreted to imply a clinical
                recommendation.
            </p>

            <h4>Ezetimibe: 6.4% relative risk reduction</h4>
            <p>
                Ezetimibe was shown to lower the risk of recurrent cardiovascular events in patientswith recent
                myocardial infarction by 6.4%. The 2018 ACC/AHA Cholesterol Guidelines recommend adding ezetimibe for
                patients with cardiovascular disease who have LDL-C &gt;=70 mg/dL on maximally tolerated statin therapy.
            </p>
            <p className={styles.lighter}>
                Cannon CP, Blazing MA, Giugliano RP, McCagg A, White JA, Theroux P, Darius H, Lewis BS, Ophuis TO,
                Jukema JW, De Ferrari GM, Ruzyllo W, De Lucca P, Im K, Bohula EA, Reist C, Wiviott SD, Tershakovec AM,
                Musliner TA, Braunwald E, Califf RM; IMPROVE-IT Investigators. Ezetimibe Added to Statin Therapy after
                Acute Coronary Syndromes. N Engl J Med. 2015 Jun 18;372(25):2387-97. doi: 10.1056/NEJMoa1410489. Epub
                2015 Jun 3. PMID: 26039521.
            </p>

            <h4>PCSK9 inhibitors (alirocumab, evolocumab): 15% relative risk reduction</h4>
            <p>
                PCSK9 inhibitors were shown to lower the risk of cardiovascular events by 15% when added to maximally
                tolerated statin therapy. Current ACC/AHA Guidelines recommend PCSK9i for patients with established
                cardiovascular disease at very highrisk of recurrent events who have LDL-C of 70 mg/dL or above on
                maximally tolerated statin therapy and ezetimibe.
            </p>
            <p className={styles.lighter}>
                Schwartz GG, Steg PG, Szarek M, Bhatt DL, Bittner VA, Diaz R, Edelberg JM, Goodman SG, Hanotin C,
                Harrington RA, Jukema JW, Lecorps G, Mahaffey KW, Moryusef A, Pordy R, Quintero K, Roe MT, Sasiela WJ,
                Tamby JF, Tricoci P, White HD, Zeiher AM; ODYSSEY OUTCOMES Committees and Investigators. Alirocumab and
                Cardiovascular Outcomes after Acute Coronary Syndrome. N Engl J Med. 2018 Nov 29;379(22):2097-2107. doi:
                10.1056/NEJMoa1801174. Epub 2018 Nov 7. PMID: 30403574.
            </p>
            <p className={styles.lighter}>
                Schwartz GG, Steg PG, Szarek M, Bhatt DL, Bittner VA, Diaz R, Edelberg JM, Goodman SG, Hanotin C,
                Harrington RA, Jukema JW, Lecorps G, Mahaffey KW, Moryusef A, Pordy R, Quintero K, Roe MT, Sasiela WJ,
                Tamby JF, Tricoci P, White HD, Zeiher AM; ODYSSEY OUTCOMES Committees and Investigators. Alirocumab and
                Cardiovascular Outcomes after Acute Coronary Syndrome. N Engl J Med. 2018 Nov 29;379(22):2097-2107. doi:
                10.1056/NEJMoa1801174. Epub 2018 Nov 7. PMID: 30403574.
            </p>

            <h4>Aspirin</h4>
            <p>
                In meta analyses aspirin therapy was not associated with a statistically significant reduction in the
                risk
                of cardiovascular events in patients with peripheral arterial disease alone (RR 0.75, 95% CI 0.48-1.18),
                so
                risk estimates are not changed if aspirin monotherapy is added in patients with PAD in this simulation.
                The
                2016 AHA/ACC Guidelines recommend antiplatelet therapy with aspirin alone (75-325 mg)or clopidogrel (75
                mg)
                for all patients with PAD. Aspirin has been shown to lower cardiovascular events in patients with
                coronary
                artery disease and/or cerebrovascular disease by 21%.
            </p>
            <p className={styles.lighter}>
                Berger JS, Krantz MJ, Kittelson JM, Hiatt WR. Aspirin for the prevention of cardiovascular events in
                patients with peripheral artery disease: a meta-analysis of randomized trials. JAMA. 2009 May
                13;301(18):1909-19. doi: 10.1001/jama.2009.623. PMID: 19436018.
            </p>
            <p className={styles.lighter}>
                Gerhard-Herman MD, Gornik HL, Barrett C, Barshes NR, Corriere MA, Drachman DE, Fleisher LA, Fowkes FGR,
                Hamburg NM, Kinlay S, Lookstein R, Misra S, Mureebe L, Olin JW, Patel RAG, Regensteiner JG, Schanzer A,
                Shishehbor MH, Stewart KJ, Treat-Jacobson D, Walsh ME. 2016 AHA/ACC Guideline on the Management of
                Patients
                With Lower Extremity Peripheral Artery Disease: Executive Summary: A Report of the American College of
                Cardiology/American Heart Association Task Force on Clinical Practice Guidelines. J Am Coll Cardiol.
                2017
                Mar 21;69(11):1465-1508. doi: 10.1016/j.jacc.2016.11.008. Epub 2016 Nov 13. Erratum in: J Am Coll
                Cardiol.
                2017 Mar 21;69(11):1520. PMID: 27851991.
            </p>

            <h4>P2Y12 Inhibitors: Clopidogrel or Ticagrelor</h4>
            <p>
                Clopidogrel has been shown to lower the risk of cardiovascular events compared to aspirin alone in those
                with cardiovascular disease, with an 8.7% relative risk reduction across all patients with CVD and a 24%
                relative risk reduction in those with PAD. Clopidogrel and ticagrelor were equally effective in reducing
                events in patients with peripheral arterial disease. The benefit of dual antiplatelet therapy and
                prolonged monotherapy with P2Y12 Inhibitors is greater in those with recent stents; this calculator is
                not intended to simulate the benefit of therapy in that population. 2016 ACC/AHA PAD Guidelines note
                that the effectiveness of dual antiplatelet therapy (aspirin + P2Y12 inhibitor) to reduce the risk of
                cardiovascular ischemic events in patients with symptomatic PAD is not well established. DAPT is
                recommended for at least 12 months following acute coronary syndrome. In patients with stable ischemic
                heart disease guidelines state that extended DAPT “may be reasonable” (Class IIb).
            </p>
            <p className={styles.lighter}>
                CAPRIE Steering Committee. A randomised, blinded, trial of clopidogrel versus aspirin in patients at
                riskof ischaemic events (CAPRIE). CAPRIE Steering Committee. Lancet. 1996 Nov 16;348(9038):1329-39. doi:
                10.1016/s0140-6736(96)09457-3. PMID: 8918275.
            </p>
            <p className={styles.lighter}>
                Hiatt WR, Fowkes FG, Heizer G, Berger JS, Baumgartner I, Held P, Katona BG, Mahaffey KW, Norgren L,
                Jones WS, Blomster J, Millegård M, Reist C, Patel MR; EUCLID Trial Steering Committee and Investigators.
                Ticagrelor versus Clopidogrel in Symptomatic Peripheral Artery Disease. N Engl J Med. 2017 Jan
                5;376(1):32-40. doi: 10.1056/NEJMoa1611688. Epub 2016 Nov 13. PMID: 27959717.
            </p>
            <p className={styles.lighter}>
                Levine GN, Bates ER, Bittl JA, Brindis RG, Fihn SD, Fleisher LA, Granger CB, Lange RA, Mack MJ, Mauri L,
                Mehran R, Mukherjee D, Newby LK, O'Gara PT, Sabatine MS, Smith PK, Smith SC Jr, Halperin JL, Levine GN,
                Al-Khatib SM, Birtcher KK, Bozkurt B, Brindis RG, Cigarroa JE, Curtis LH, Fleisher LA, Gentile F,
                Gidding S, Hlatky MA, Ikonomidis JS, Joglar JA, Pressler SJ, Wijeysundera DN. 2016 ACC/AHA guideline
                focused update on duration of dual antiplatelet therapy in patients with coronary artery disease: A
                report of the American College of Cardiology/American Heart Association Task Force on Clinical Practice
                Guidelines. J Thorac Cardiovasc Surg. 2016 Nov;152(5):1243-1275. doi: 10.1016/j.jtcvs.2016.07.044. PMID:
                27751237.
            </p>

            <h4>Rivaroxaban</h4>
            <p>
                Low-dose rivaroxaban 2.5 mg twice a day in addition to aspirin can lower the risk of cardiovascular
                events in patients with established cardiovascular disease by 24%. Rivaroxaban did increase bleeding
                risk by 70% (3.1% of patients on aspirin+rivaroxaban vs 1.9% of patients on aspirin alone had major
                bleeding in the COMPASS trial. It has not been tested in patients on dual antiplatelet therapy or when
                added to P2Y12 monotherapy. This is FDA approved but not part of current AHA/ACC guidelines.
            </p>
            <p className={styles.lighter}>
                Eikelboom JW, Connolly SJ, Bosch J, Dagenais GR, Hart RG, Shestakovska O, Diaz R, Alings M, Lonn EM,
                Anand SS, Widimsky P, Hori M, Avezum A, Piegas LS, Branch KRH, Probstfield J, Bhatt DL, Zhu J, Liang Y,
                Maggioni AP, Lopez-Jaramillo P, O'Donnell M, Kakkar AK, Fox KAA, Parkhomenko AN, Ertl G, Störk S, Keltai
                M, Ryden L, Pogosova N, Dans AL, Lanas F, Commerford PJ, Torp-Pedersen C, Guzik TJ, Verhamme PB,
                Vinereanu D, Kim JH, Tonkin AM, Lewis BS, Felix C, Yusoff K, Steg PG, Metsarinne KP, Cook Bruns N,
                Misselwitz F, Chen E, Leong D, Yusuf S; COMPASS Investigators. Rivaroxaban with or without Aspirin in
                Stable Cardiovascular Disease. N Engl J Med. 2017 Oct 5;377(14):1319-1330. doi: 10.1056/NEJMoa1709118.
                Epub 2017 Aug 27. PMID: 28844192.
            </p>

            <h4>GLP1 Receptor Agonists (e.g. Semaglutide, Liraglutide, etc.)</h4>
            <p>
                Liraglutide, injectable semaglutide, albiglutide, and dulaglitide have all been shown to reduce
                cardiovascular events with reductions in risk between 12% and 23% in randomized trials.
            </p>
            <p className={styles.lighter}>
                Marsico F, Paolillo S, Gargiulo P, Bruzzese D, Dell'Aversana S, Esposito I, Renga F, Esposito L,
                Marciano C, Dellegrottaglie S, Iesu I, Perrone Filardi P. Effects of glucagon-like peptide-1 receptor
                agonists on major cardiovascular events in patients with Type 2 diabetes mellitus with or without
                established cardiovascular disease: a meta-analysis of randomized controlled trials. Eur Heart J. 2020
                Sep14;41(35):3346-3358. doi: 10.1093/eurheartj/ehaa082. PMID: 32077924.
            </p>
            <p className={styles.lighter}>
                Sheahan KH, Wahlberg EA, Gilbert MP. An overview of GLP-1 agonists and recent cardiovascular outcomes
                trials. Postgrad Med J. 2020 Mar;96(1133):156-161. doi: 10.1136/postgradmedj-2019-137186. Epub 2019 Dec
                4. PMID: 31801807; PMCID: PMC7042958.
            </p>

            <h4>Statins</h4>
            <p>
                Statins lower cardiovascular disease event risk by 21% for every 39 point reduction in LDL-cholesterol.
                The benefitof statins depends on the starting cholesterol and the intensity of statin. ACC/AHA
                Guidelines recommend high-intensity statin for all patients with atherosclerotic cardiovascular disease.
            </p>
            <table>
                <thead>
                <tr>
                    <th>High Intensity Statins (50% or more LDL Lowering)</th>
                    <th>Moderate Intensity Statins(30-50% LDL Lowering)</th>
                    <th>Low Intensity Statins (&lt;30% LDL Lowering)</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Atorvastatin ≥40 mg</td>
                    <td>Atorvastatin 10-20 mg</td>
                    <td/>
                </tr>
                <tr>
                    <td>Rosuvastatin ≥20 mg</td>
                    <td>Rosuvastatin 5-10 mg</td>
                    <td/>
                </tr>
                <tr>
                    <td/>
                    <td>Pravastatin 40-80 mg</td>
                    <td>Pravastatin 10-20 mg</td>
                </tr>
                <tr>
                    <td/>
                    <td>Lovastatin 40 mg</td>
                    <td>Lovastatin 20 mg</td>
                </tr>
                <tr>
                    <td/>
                    <td>Fluvastatin 80 mg daily dose</td>
                    <td>Fluvastatin 20-40 mg</td>
                </tr>
                <tr>
                    <td/>
                    <td>Simvastatin 20-40 mg</td>
                    <td>Simvastatin 10 mg</td>
                </tr>
                <tr>
                    <td/>
                    <td>Pitavastatin 2-4 mg</td>
                    <td/>
                </tr>
                </tbody>
            </table>

            <p className={styles.lighter}>
                Cholesterol Treatment Trialists' (CTT) Collaborators, Mihaylova B, Emberson J, et al. The effects of
                lowering LDL cholesterol with statin therapy in people at low risk of vascular disease: meta-analysis of
                individual data from 27 randomised trials. Lancet. 2012;380(9841):581-590.
                doi:10.1016/S0140-6736(12)60367-5
            </p>

            <h4>Blood pressure</h4>
            <p>Relative risk reductions for blood pressure lowering depend on starting blood pressure and the patient
                population. Current guideline-recommendedBP goals for patients with established cardiovascular disease
                are &lt;130 / &lt;80.
            </p>

            <h4>Smoking</h4>
            <p>
                Smoking status used to calculate 10-year risk. Quitting smoking will lower risk. The impact of smoking
                cessation on 10-year risk depends on duration since quitting.
            </p>
        </Container>
    );
}

export default ForProviders;
