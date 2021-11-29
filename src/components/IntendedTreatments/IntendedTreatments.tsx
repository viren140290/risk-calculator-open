import React, {useState} from 'react';
import cx from 'classnames';
import styles from './IntendedTreatments.module.scss';
import SingleCheckboxGroup from "../shared/SingleCheckboxGroup/SingleCheckboxGroup";
import CheckDropGroup from "../shared/CheckDropGroup/CheckDropGroup";
import Col from "react-bootstrap/Col";
import {Comorbidities, Treatments} from "../../services/FHIRService";
import {SelectOption} from "../../interfaces/FormBlocks.intefaces";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    getMsg,
    resolveStatinOptions,
    resolveP2y12Options
} from "../App/utils";
import {useIntl} from "react-intl";

interface IntendedTreatmentsProps {
    treatments?: Treatments,
    comorbidities?: Comorbidities,
    onTreatmentsChange: (treatments: Treatments) => void
}

function IntendedTreatments(props: IntendedTreatmentsProps) {
    const [treatments, setTreatments] = useState(props.treatments);

    const intl = useIntl()

    const STATIN_TREATMENT_OPTIONS: Array<SelectOption> = resolveStatinOptions(intl);
    const P2Y12_INHIBITOR_OPTIONS: Array<SelectOption> = resolveP2y12Options(intl);

    const valueHandler = (field: string, value: any) => {
        //console.log(`IntendedTreatments valueHandler. ${field} -> ${value}`);
        const newTreatments: Treatments = {...treatments, ...{[field]: value}};
        setTreatments(newTreatments);
        props.onTreatmentsChange(newTreatments);
    }

    const statinValueHandler = (field: string, value: string) => {
        valueHandler('statin', value ? {intensity: value} : undefined);
    }

    const p2Y12InhibitorsValueHandler = (field: string, value: string) => {
        valueHandler('p2Y12Inhibitors', value ? value : '');
    }

    return (
        <div className={cx(styles.subcontainerInner, styles.subcontainerInner__inputContainer)}>
            <div className={styles.subcontainerInner__sectionTitle}>
                <b>{getMsg(intl, 'treatments.form.section_header.intended_treatments')}</b>
            </div>

            <div className={styles.subcontainerInner__sectionBody}>
                <Col md={12} className={styles.subcontainerInner__sectionInfo}>
                    <span className={styles.boldText}>
                        <FontAwesomeIcon icon='info-circle'/>
                        &nbsp; {getMsg(intl, 'treatments.form.info.select_treatment')}
                    </span>
                </Col>

                <b>{getMsg(intl, 'treatments.form.section_subheader.lipid_lowering')}</b><br/>
                <CheckDropGroup
                    label={getMsg(intl, 'treatments.form.control.statin.label')}
                    defaultValue={
                        treatments?.statin ?
                            {value: `${treatments.statin.intensity}`} :
                            undefined
                    }
                    selectOptions={STATIN_TREATMENT_OPTIONS}
                    name="statin"
                    valueHanlder={statinValueHandler}
                />
                <SingleCheckboxGroup
                    label={getMsg(intl, 'treatments.form.control.pcsk9.label')}
                    checked={treatments?.isPCSK9Ihibitor}
                    name="isPCSK9Ihibitor"
                    valueHanlder={valueHandler}
                />
                <SingleCheckboxGroup
                    label={getMsg(intl, 'treatments.form.control.ezetimibe.label')}
                    checked={treatments?.isEzetimib}
                    name="isEzetimib"
                    valueHanlder={valueHandler}
                />

                <b>{getMsg(intl, 'treatments.form.section_subheader.antiplatelet')}</b><br/>
                <SingleCheckboxGroup
                    label={getMsg(intl, 'treatments.form.control.aspirin.label')}
                    checked={treatments?.isAspirin}
                    name="isAspirin"
                    valueHanlder={valueHandler}
                />
                <CheckDropGroup
                    label={getMsg(intl, 'treatments.form.control.p2i12.label')}
                    defaultValue={
                        treatments?.p2Y12Inhibitors ?
                            {value: treatments.p2Y12Inhibitors.toLowerCase()} :
                            undefined
                    }
                    name="p2Y12Inhibitors"
                    disabled={!!treatments?.isRivaroxaban}
                    selectOptions={P2Y12_INHIBITOR_OPTIONS}
                    valueHanlder={p2Y12InhibitorsValueHandler}
                />
                <SingleCheckboxGroup
                    label={getMsg(intl, 'treatments.form.control.rivaroxaban.label')}
                    disabled={!!treatments?.p2Y12Inhibitors}
                    checked={treatments?.isRivaroxaban}
                    name="isRivaroxaban"
                    valueHanlder={valueHandler}
                />

                <b>{getMsg(intl, 'treatments.form.section_subheader.diabetes')}</b><br/>
                <SingleCheckboxGroup
                    label={getMsg(intl, 'treatments.form.control.sglt2.label')}
                    disabled={!props.comorbidities?.diabetes}
                    checked={treatments?.isSGLT2Inhibitors}
                    name="isSGLT2Inhibitors"
                    valueHanlder={valueHandler}
                />
                <SingleCheckboxGroup
                    label={getMsg(intl, 'treatments.form.control.glp1.label')}
                    disabled={!props.comorbidities?.diabetes}
                    checked={treatments?.isGLP1ReceptorAgonists}
                    name="isGLP1ReceptorAgonists"
                    valueHanlder={valueHandler}
                />
            </div>
        </div>

    );
}

export default IntendedTreatments;
