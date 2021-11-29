import React, {useEffect, useRef} from 'react';
import {useIntl} from "react-intl";

import cx from 'classnames';
import styles from './GraphResults.module.scss';
import {Bar} from "react-chartjs-2";
import Chart, {ChartOptions} from 'chart.js';

import {PatientData, Treatments} from "../../services/FHIRService";
import IntendedTreatments from "../IntendedTreatments/IntendedTreatments";
import CalculatorService from "../../services/CalculatorService";
import {resolveITPaintPattern} from "./utils";
import {getMsg, treatmentsAreEqual} from "../App/utils"

interface GraphResultsProps {
    cvdRiskScoreNoTreatment: number,
    cvdRiskScoreCurrentTreatment: number,
    cvdRiskScoreIntendedTreatment: number,
    patientData?: PatientData,
    currentTreatments?: Treatments,
    intendedTreatments?: Treatments,
    onIntendedTreatmentsSave: (treatments: Treatments, scoreWithTreatments: number) => void,
}

function GraphResults({
    cvdRiskScoreNoTreatment,
    cvdRiskScoreCurrentTreatment,
    cvdRiskScoreIntendedTreatment,
    currentTreatments,
    intendedTreatments,
    patientData,
    onIntendedTreatmentsSave
}: GraphResultsProps) {
    const intl = useIntl()

    Chart.pluginService.register({
        beforeRender: function (chart: any) {
            if (chart.config.options['showAllTooltips']) {
                // create an array of tooltips
                // we can't use the chart tooltip because there is only one tooltip per chart
                chart['pluginTooltips'] = [];
                chart.config.data.datasets.forEach(function (dataset: any, i: number) {
                    chart.getDatasetMeta(i).data.forEach(function (sector: any, j: number) {
                        chart['pluginTooltips'].push(new (Chart as any).Tooltip({
                            _chart: chart['chart'],
                            _chartInstance: chart,
                            _data: chart.data,
                            _options: chart['options']['tooltips'],
                            _active: [sector]
                        }, chart));
                    });
                });

                // turn off normal tooltips
                chart['options']['tooltips']['enabled'] = false;
            }
        },
        afterDraw: function (chart:any, easing: any) {
            if (chart.config.options['showAllTooltips']) {
                // we don't want the permanent tooltips to animate, so don't do anything till the animation runs atleast once
                if (!chart['allTooltipsOnce']) {
                    if (easing !== 1)
                        return;
                    chart['allTooltipsOnce'] = true;
                }

                // turn on tooltips
                chart['options']['tooltips']['enabled'] = true;
                Chart.helpers.each(chart['pluginTooltips'], function (tooltip: any) {
                    tooltip.initialize();
                    tooltip.update();
                    // we don't actually need this since we are not animating tooltips
                    tooltip.pivot();
                    tooltip.transition(easing).draw();
                });
                chart['options']['tooltips']['enabled'] = false;
            }
        }
    });

    //The purpose of the lines below is to keep intended treatments as a local variable without using inner or outer
    //state as we need to update only a part of the chart.
    //The outer state of parent component will save the results only on this component's destroy (normally happens when switching tabs)
    //which will guarantee we'll get the previous state of charts and checkboxes when navigating back to this component.
    const localIntendedTreatments: any  =
        useRef({intendedTreatments: intendedTreatments, riskScore: cvdRiskScoreIntendedTreatment});

    //Fires on component's unmount
    useEffect(() =>
        () => {
            onIntendedTreatmentsSave(
                localIntendedTreatments.current.intendedTreatments,
                localIntendedTreatments.current.riskScore
            )
        // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []
    );

    const options: ChartOptions = {
        animation: {
            easing: 'easeOutBounce'
        },
        layout: {
            padding: {
                top: 40
            }
        },
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true,
                    callback(value: any) {
                        return `${Math.round((value * 100) / 100)}%`;
                    },
                }
            }],
            xAxes: [{
                offset: true
            }]
        },
        tooltips: {
            displayColors: false,
            // @ts-ignore
            yAlign: 'bottom',
            xAlign: 'center',
            callbacks: {
                title: () => [],
                label: function(tooltipItem: {yLabel: number}) {
                    return `${Math.round(tooltipItem.yLabel * 100 / 100)}%`;
                }
            }
        },
        legend: {
            display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
        // @ts-ignore
        showAllTooltips: true
    };
    const data = {
        labels: [
            getMsg(intl, 'graph.data.label.no_treatment'),
            getMsg(intl, 'graph.data.label.current_treatment'),
            getMsg(intl, 'graph.data.label.intended_treatment')
        ],
        datasets: [
            {
                data: [
                    cvdRiskScoreNoTreatment,
                    cvdRiskScoreCurrentTreatment,
                    cvdRiskScoreIntendedTreatment,
                ],
                backgroundColor: [
                    '#ED6E85',
                    '#6CBDBF',
                    resolveITPaintPattern(treatmentsAreEqual(currentTreatments, intendedTreatments))
                ],
                borderWidth: 1,
                borderColor: [
                    'rgba(83,163,163,0.2)',
                    'rgba(19,85,85,0.2)',
                    'rgba(12,11,11,0.1)',
                ],
            },
        ],
    };

    // const barChartReference =
    //     React.createRef<{chartInstance:{ data?: { datasets?: Array<{ data?: Array<any>, backgroundColor?: Array<any> }> } }}>();
    const barChartReference = React.createRef<Bar>();

    /**
     * Handles intended treatments updates on the corresponding section of the app.
     */
    const intendedTreatmentsUpdateHandler = (intendedTreatmentsUpdated: Treatments) => {
        //console.log(`Intended treatments applied -> ${JSON.stringify(intendedTreatmentsUpdated, null, 2)}`)

        if( treatmentsAreEqual(currentTreatments, intendedTreatmentsUpdated)) {
            updateIntendedTreatmentsOnGraph(cvdRiskScoreCurrentTreatment, true);

            localIntendedTreatments.current = {
                intendedTreatments: intendedTreatmentsUpdated,
                riskScore: cvdRiskScoreCurrentTreatment
            };
        } else {
            const newCvdRiskScoreWithIntendedTreatment = CalculatorService.applyTreatments(
                cvdRiskScoreNoTreatment,
                patientData,
                currentTreatments?.statin?.intensity,
                intendedTreatmentsUpdated
            );

            updateIntendedTreatmentsOnGraph(newCvdRiskScoreWithIntendedTreatment, false);

            localIntendedTreatments.current = {
                intendedTreatments: intendedTreatmentsUpdated,
                riskScore: newCvdRiskScoreWithIntendedTreatment
            };
        }
    };

    const updateIntendedTreatmentsOnGraph = (cvRiskScoreIntendedTreatment: number, isScoreEqualToCurrent: boolean): void => {
        if (
            barChartReference?.current?.chartInstance?.data?.datasets &&
            barChartReference?.current?.chartInstance?.data?.datasets.length > 0
        ) {

            if(
                barChartReference.current.chartInstance.data.datasets[0]?.data &&
                barChartReference.current.chartInstance.data.datasets[0].data.length === 3
            ) {
                barChartReference.current.chartInstance.data.datasets[0].data[2] = cvRiskScoreIntendedTreatment;
            }

            if(
                barChartReference.current.chartInstance.data.datasets[0]?.backgroundColor &&
                // @ts-ignore
                barChartReference.current.chartInstance.data.datasets[0].backgroundColor.length === 3
            ) {
                // @ts-ignore
                barChartReference.current.chartInstance.data.datasets[0].backgroundColor[2] =
                    resolveITPaintPattern(isScoreEqualToCurrent);
            }
        }

        // @ts-ignore
        barChartReference?.current?.chartInstance?.update();
    };

    // const BarChart =
    //     React.forwardRef<Bar, BarChartProps>((barChartProps, ref) => (
    //     <div className={styles.subcontainerInner}>
    //         <div className={styles.subcontainerInner__sectionTitle}>
    //             <b>Estimated 10-year risk for MACE (MI, stroke, CV-death)</b>
    //         </div>
    //         <div className={cx(styles.subcontainerInner__sectionBody, styles.subcontainerInner__chartContainer)}>
    //             <Bar id="barChart"
    //                  ref={ref}
    //                  data={barChartProps.data}
    //                  options={barChartProps.options}/>
    //         </div>
    //     </div>
    // ));

    return (
        <>
            {/*<BarChart*/}
            {/*    ref={barChartReference}*/}
            {/*    options={options}*/}
            {/*    data={data}*/}
            {/*/>*/}
            <div className={styles.subcontainerInner}>
                <div className={styles.subcontainerInner__sectionTitle}>
                    <b>Estimated 10-year risk for MACE (MI, stroke, CV-death)</b>
                </div>
                <div className={cx(styles.subcontainerInner__sectionBody, styles.subcontainerInner__chartContainer)}>
                    <Bar id="barChart"
                         ref={barChartReference}
                         data={data}
                         options={options}/>
                </div>
            </div>
            <IntendedTreatments
                treatments={intendedTreatments}
                comorbidities={patientData?.comorbidities}
                onTreatmentsChange={intendedTreatmentsUpdateHandler}
            />
        </>
    );
}

export default GraphResults;
