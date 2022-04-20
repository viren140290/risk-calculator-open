import React, {useState} from 'react';
import styles from './CalcForm.module.scss';
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import {Form, Formik, FormikValues} from 'formik';
import cx from "classnames";
import {Button, Collapse, Container, Spinner} from "react-bootstrap/esm/index";
import InputGroup from "../shared/InputGroup/InputGroup";
import SelectGroup from "../shared/SelectGroup/SelectGroup";
import SingleCheckboxGroup from "../shared/SingleCheckboxGroup/SingleCheckboxGroup";
import CheckDropGroup from "../shared/CheckDropGroup/CheckDropGroup";
import ButtonGroup from "../shared/ButtonGroup/ButtonGroup";
import {PatientData, Treatments} from "../../services/FHIRService";
import {SelectOption} from "../../interfaces/FormBlocks.intefaces";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faChevronDown, faChevronUp, faExclamationTriangle, faInfoCircle} from '@fortawesome/free-solid-svg-icons';
import {library} from '@fortawesome/fontawesome-svg-core';
// import {useIntl} from "react-intl";
import {
    getMsg,
    resolveSexOptions,
    resolveResidenceOptions,
    resolveStatinOptions,
    resolveP2y12Options
} from "../App/utils";

import {
    convertToPatientInfo,
    convertToTreatments,
    initFormikValidationSchema,
    resolvePatientDetailsSummary,
    resolvePatientTreatmentsSummary
} from "./utils";

interface CalcFormProps {
    isProcessing?: boolean,
    isSubmitted?: boolean,
    patientData?: PatientData,
    treatments?: Treatments,
    onPatientDataSubmit: (patientData: PatientData, currentTreatments: Treatments) => void,
    onPatientDataRestore: () => void,
}

interface CalcFormState {
    isPatientCollapseOpen: boolean,
    isCurrentTreatmentsCollapseOpen: boolean,
    isFormSubmitted: boolean
}

library.add(faChevronDown, faChevronUp, faInfoCircle, faExclamationTriangle);

function CalcForm(props: CalcFormProps) {
    const [state, setState] = useState<CalcFormState>({
        isPatientCollapseOpen: !props.isSubmitted,
        isCurrentTreatmentsCollapseOpen: !props.isSubmitted,
        isFormSubmitted: !!props.isSubmitted
    });

    const intl = null;

    const SEX_OPTIONS: Array<SelectOption> = resolveSexOptions(intl);
    const RESIDENCE_OPTIONS: Array<SelectOption> = resolveResidenceOptions(intl);
    const STATIN_TREATMENT_OPTIONS: Array<SelectOption> = resolveStatinOptions(intl);
    const P2Y12_INHIBITOR_OPTIONS: Array<SelectOption> = resolveP2y12Options(intl);

    const initialValues = {
        age: props.patientData?.age || '',
        sex: props.patientData?.gender || '',
        isSmoking: props.patientData?.comorbidities?.smoking || false,
        systolicBloodPressure: props.patientData?.labResults?.systolicBloodPressure?.value || '',
        totalCholesterol: props.patientData?.labResults?.totalCholesterol?.value || '',
        creatinine: props.patientData?.labResults?.creatinine?.value || '',
        ldlCholesterol: props.patientData?.labResults?.ldlCholesterol?.value || '',
        isDiabetesMellitus: props.patientData?.comorbidities?.diabetes || false,
        isCAD: props.patientData?.comorbidities?.coronaryArteryDisease || false,
        isCVD: props.patientData?.comorbidities?.cerebrovascularDisease || false,
        isPAD: props.patientData?.comorbidities?.peripheralArteryDisease || false,
        isAtrialFibrillation: props.patientData?.comorbidities?.atrialFibrillation || false,
        isCHF: props.patientData?.comorbidities?.congestiveHeartFailure || false,
        residence: 'NA',
        statinIntensity: props.treatments?.statin?.intensity,
        statinMedication: props.treatments?.statin?.label,
        isPCSK9Ihibitor: props.treatments?.isPCSK9Ihibitor || false,
        isEzetimib: props.treatments?.isEzetimib || false,
        isSGLT2Inhibitors: props.treatments?.isSGLT2Inhibitors || false,
        isGLP1ReceptorAgonists: props.treatments?.isGLP1ReceptorAgonists || false,
        isAspirin: props.treatments?.isAspirin || false,
        p2Y12Inhibitors: props.treatments?.p2Y12Inhibitors || '',
        isRivaroxaban: props.treatments?.isRivaroxaban || false,
    };

    const onSubmitHanlder = (values: FormikValues) => {
        //console.log(`onSubmit --> ${JSON.stringify(values, null, 2)}`);

        const updatedPatientData: PatientData = convertToPatientInfo(values, props.patientData);
        const updatedTreatments: Treatments = convertToTreatments(values);

        // Removing label from statins if the value has been changed upon submission since it represents a concrete
        // medication taken from patient's medical record
        if (updatedTreatments.statin && updatedTreatments.statin?.intensity !== props.treatments?.statin?.intensity) {
            updatedTreatments.statin.label = undefined;
        }

        props.onPatientDataSubmit(updatedPatientData, updatedTreatments);
    };

    const SectionHeader = (sectionHeaderProps: {
        title: string,
        summarySubtitle: string,
        isCollapseOpen: boolean,
        values: FormikValues,
        clickHandler: () => void
    }) => (
        <Row
            className={styles.subcontainer__sectionTitle}
            tabIndex={0}
            onClick={sectionHeaderProps.clickHandler}
            onKeyDown={(event: any) => {
                if (event.keyCode === 32 || event.keyCode === 13) { //spacebar or enter
                    sectionHeaderProps.clickHandler();
                    event.preventDefault()
                }
            }}
        >
            <Col className={styles.leftText} md={11}>
                    <span className={props.isProcessing ? '' : styles.invisible}>
                        <Spinner animation="border" size="sm" variant="primary"/>
                        &nbsp;&nbsp;
                    </span>
                <b>{sectionHeaderProps.title}</b>
                <br/>
                <span
                    className={sectionHeaderProps.isCollapseOpen || !state.isFormSubmitted ? styles.invisible : styles.lighter}>
                        {sectionHeaderProps.summarySubtitle}
                    </span>
            </Col>
            <Col className={!state.isFormSubmitted ? styles.invisible : styles.rightText}>
                {sectionHeaderProps.isCollapseOpen && <FontAwesomeIcon icon='chevron-up'/>}
                {!sectionHeaderProps.isCollapseOpen && <FontAwesomeIcon icon='chevron-down'/>}
            </Col>
        </Row>
    );

    const CalcFormFooter = (footerProps: {
        isFormValid: boolean,
        isFormDirty: boolean,
        isFormSubmitted: boolean,
        setFormValuesHandler: (values: any, shouldRevalidate?: boolean) => void,
        initialValues: FormikValues
    }) => {

        /**
         * This method handles reset within current component's state (i.e. before form submit)
         * After submit, reset will be handled by parent's component as it holds the initial data.
         */
        const restoreToCurrentState = () => {
            footerProps.setFormValuesHandler(initialValues);
            setState(prevState => ({
                ...prevState,
                isCurrentTreatmentsCollapseOpen: true,
                isPatientCollapseOpen: true
            }))
        };

        return <Collapse in={state.isPatientCollapseOpen || state.isCurrentTreatmentsCollapseOpen}>
            <Row className={styles.subcontainer__footer}>
                <Button size={'lg'} variant='secondary' disabled={props.isProcessing}
                        onClick={() => {
                            restoreToCurrentState();
                            props.onPatientDataRestore();
                        }}
                >
                    {getMsg(intl, 'calcform.footer.button.restore')}
                </Button>

                &nbsp;&nbsp;&nbsp;

                <Button size={'lg'} type="submit"
                        disabled={
                            props.isProcessing ||
                            !footerProps.isFormValid ||
                            // Since initially valid form is not going to be marked "dirty"
                            // making sure not to check for modifications straight away but let it to be
                            // submitted first.
                            (footerProps.isFormSubmitted && !footerProps.isFormDirty)
                        }
                >
                    {getMsg(intl, 'calcform.footer.button.calculate')}
                </Button>
            </Row>
        </Collapse>
    };

    return (
        <div className={styles.container}>
            <Formik
                validationSchema={initFormikValidationSchema(intl)}
                initialValues={initialValues}
                onSubmit={onSubmitHanlder}
                enableReinitialize
                validateOnMount
                validateOnChange
            >
                {({
                      handleSubmit,
                      handleChange,
                      setValues,
                      setFieldValue,
                      values,
                      touched,
                      isValid,
                      dirty,
                      errors,
                  }) => (
                    <Container>
                        <Form noValidate onSubmit={handleSubmit}>
                            <Col className={styles.subcontainer}>
                                <SectionHeader
                                    title={getMsg(intl, 'calcform.form.section_header.patient_details')}
                                    summarySubtitle={resolvePatientDetailsSummary(intl, initialValues)}
                                    isCollapseOpen={state.isPatientCollapseOpen}
                                    values={values}
                                    clickHandler={() =>
                                        state.isFormSubmitted &&
                                        setState(prevState => ({
                                            ...prevState,
                                            isPatientCollapseOpen: !prevState.isPatientCollapseOpen
                                        }))
                                    }
                                />
                                <Collapse in={state.isPatientCollapseOpen}>
                                    <Row className={styles.subcontainer__sectionBody} xs={1} md={2}>
                                        <Col md={12} className={styles.subcontainer__sectionInfo}>
                                            <span>
                                                  <FontAwesomeIcon icon='info-circle'/>
                                                &nbsp;
                                                {getMsg(intl, 'calcform.form.info.provider_to_confirm')}
                                            </span>
                                        </Col>
                                        <Col md={6}>
                                            <h6>{getMsg(intl, 'calcform.form.section_subheader.demographics')}</h6>
                                            <InputGroup
                                                label={getMsg(intl, 'calcform.form.control.age.label')}
                                                value={values.age}
                                                placeholder={getMsg(intl, 'calcform.form.control.age.placeholder')}
                                                name="age"
                                                controlId="validationAge"
                                                error={errors.age}
                                                isTouched={touched.age}
                                                changeHanlder={handleChange}
                                                disabled={props.isProcessing}
                                            />
                                            <ButtonGroup
                                                label={getMsg(intl, 'calcform.form.control.sex.label')}
                                                defaultValue={values.sex ? {value: values.sex} : undefined}
                                                selectOptions={SEX_OPTIONS}
                                                name="sex"
                                                controlId="validationSex"
                                                error={errors.sex}
                                                isTouched={touched.sex}
                                                changeHanlder={handleChange}
                                                disabled={props.isProcessing}
                                            />
                                            <SelectGroup
                                                label={getMsg(intl, 'calcform.form.control.residence.label')}
                                                defaultValue={values.residence ? {value: values.residence} : undefined}
                                                selectOptions={RESIDENCE_OPTIONS}
                                                name="residence"
                                                controlId="validationResidence"
                                                error={errors.residence}
                                                isTouched={touched.residence}
                                                changeHanlder={handleChange}
                                                disabled
                                            />
                                            <InputGroup
                                                label={getMsg(intl, 'calcform.form.control.sbp.label')}
                                                value={values.systolicBloodPressure}
                                                placeholder={getMsg(intl, 'calcform.form.control.sbp.placeholder')}
                                                name="systolicBloodPressure"
                                                controlId="validationSystolicBloodPressure"
                                                error={errors.systolicBloodPressure}
                                                isTouched={touched.systolicBloodPressure}
                                                changeHanlder={handleChange}
                                                disabled={props.isProcessing}
                                            />
                                            <InputGroup
                                                label={getMsg(intl, 'calcform.form.control.creatinine.label')}
                                                value={values.creatinine}
                                                placeholder={getMsg(intl, 'calcform.form.control.creatinine.placeholder')}
                                                name="creatinine"
                                                controlId="validationCreatinine"
                                                error={errors.creatinine}
                                                isTouched={touched.creatinine}
                                                changeHanlder={handleChange}
                                                disabled={props.isProcessing}
                                            />
                                            <InputGroup
                                                label={getMsg(intl, 'calcform.form.control.totalCholesterol.label')}
                                                value={values.totalCholesterol}
                                                placeholder={getMsg(intl, 'calcform.form.control.totalCholesterol.placeholder')}
                                                name="totalCholesterol"
                                                controlId="validationTotalCholesterol"
                                                error={errors.totalCholesterol}
                                                isTouched={touched.totalCholesterol}
                                                changeHanlder={handleChange}
                                                disabled={props.isProcessing}
                                            />
                                            <InputGroup
                                                label={getMsg(intl, 'calcform.form.control.ldlCholesterol.label')}
                                                value={values.ldlCholesterol}
                                                placeholder={getMsg(intl, 'calcform.form.control.ldlCholesterol.placeholder')}
                                                name="ldlCholesterol"
                                                controlId="validationLdlCholesterol"
                                                error={errors.ldlCholesterol}
                                                isTouched={touched.ldlCholesterol}
                                                changeHanlder={handleChange}
                                                disabled={props.isProcessing}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <h6>{getMsg(intl, 'calcform.form.section_subheader.comorbidities')}</h6>
                                            <div
                                                className={cx(
                                                    styles.groupedColumn,
                                                    errors.isCAD && !props.isProcessing ? styles['groupedColumn__required'] : ''
                                                )}
                                            >
                                                <SingleCheckboxGroup
                                                    label={getMsg(intl, 'calcform.form.control.cad.label')}
                                                    name="isCAD"
                                                    checked={values.isCAD}
                                                    error={errors.isCAD}
                                                    valueHanlder={setFieldValue}
                                                    disabled={props.isProcessing}
                                                />
                                                <SingleCheckboxGroup
                                                    label={getMsg(intl, 'calcform.form.control.cvd.label')}
                                                    name="isCVD"
                                                    checked={values.isCVD}
                                                    error={errors.isCVD}
                                                    valueHanlder={setFieldValue}
                                                    disabled={props.isProcessing}
                                                />
                                                <SingleCheckboxGroup
                                                    label={getMsg(intl, 'calcform.form.control.pad.label')}
                                                    name="isPAD"
                                                    checked={values.isPAD}
                                                    error={errors.isPAD}
                                                    valueHanlder={setFieldValue}
                                                    disabled={props.isProcessing}
                                                />
                                                <small className={styles.groupedColumn__hint}>
                                                    {getMsg(intl, 'calcform.form.info.calculator_validity')}
                                                </small>
                                            </div>
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.atrial_fibrillation.label')}
                                                name="isAtrialFibrillation"
                                                checked={values.isAtrialFibrillation}
                                                error={errors.isAtrialFibrillation}
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.chf.label')}
                                                name="isCHF"
                                                checked={values.isCHF}
                                                error={errors.isCHF}
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.diabetes.label')}
                                                name="isDiabetesMellitus"
                                                checked={values.isDiabetesMellitus}
                                                error={errors.isDiabetesMellitus}
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.smoking.label')}
                                                name="isSmoking"
                                                checked={values.isSmoking}
                                                error={errors.isSmoking}
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                        </Col>
                                    </Row>
                                </Collapse>

                                <SectionHeader
                                    title={getMsg(intl, 'calcform.form.section_header.current_treatments')}
                                    summarySubtitle={resolvePatientTreatmentsSummary(intl, initialValues)}
                                    isCollapseOpen={state.isCurrentTreatmentsCollapseOpen}
                                    values={values}
                                    clickHandler={() =>
                                        state.isFormSubmitted &&
                                        setState(prevState => ({
                                            ...prevState,
                                            isCurrentTreatmentsCollapseOpen: !prevState.isCurrentTreatmentsCollapseOpen
                                        }))
                                    }
                                />
                                <Collapse in={state.isCurrentTreatmentsCollapseOpen}>
                                    <Row className={styles.subcontainer__sectionBody}>
                                        <Col md={6}>
                                            <h6 className={styles.leftText}>{getMsg(intl, 'calcform.form.section_subheader.lipid_lowering')}</h6>
                                            <CheckDropGroup
                                                label={getMsg(intl, 'calcform.form.control.statin.label')}
                                                defaultValue={
                                                    values.statinIntensity || values.statinMedication ?
                                                    {value: values.statinIntensity, label: values.statinMedication} :
                                                    undefined
                                                }
                                                selectOptions={STATIN_TREATMENT_OPTIONS}
                                                name="statinIntensity"
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                                checked={!!values.statinMedication && !values.statinIntensity}
                                                warnNoValue={
                                                    getMsg(intl, 'calcform.form.control.statin.warning',
                                                        {medication: values.statinMedication})
                                                }
                                            />
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.pcsk9.label')}
                                                name="isPCSK9Ihibitor"
                                                checked={values.isPCSK9Ihibitor}
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.ezetimibe.label')}
                                                checked={values.isEzetimib}
                                                name="isEzetimib"
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                            <h6 className={styles.leftText}>Diabetes Medication</h6>
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.sglt2.label')}
                                                checked={values.isSGLT2Inhibitors}
                                                name="isSGLT2Inhibitors"
                                                valueHanlder={setFieldValue}
                                                //Disabled if currently processing data OR when there is no Diabetes
                                                //diagnosis and no diabetes medication on the record already (as we
                                                //want to both prevent user from selecting such medication as well as prevent
                                                //one from entering inappropriate medication)
                                                disabled={props.isProcessing ||
                                                (!values.isDiabetesMellitus && !values.isSGLT2Inhibitors)}
                                            />
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.glp1.label')}
                                                checked={values.isGLP1ReceptorAgonists}
                                                name="isGLP1ReceptorAgonists"
                                                valueHanlder={setFieldValue}
                                                //Disabled if currently processing data OR when there is no Diabetes
                                                //diagnosis and no diabetes medication on the record already
                                                disabled={props.isProcessing ||
                                                (!values.isDiabetesMellitus && !values.isGLP1ReceptorAgonists)}
                                            />
                                        </Col>
                                        <Col md={6}>
                                            <h6 className={styles.leftText}>{getMsg(intl, 'calcform.form.section_subheader.antiplatelet')}</h6>
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.aspirin.label')}
                                                name="isAspirin"
                                                checked={values.isAspirin}
                                                error={errors.isAspirin}
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                            <CheckDropGroup
                                                label={getMsg(intl, 'calcform.form.control.p2i12.label')}
                                                defaultValue={values.p2Y12Inhibitors ?
                                                    {value: values.p2Y12Inhibitors.toLowerCase()} :
                                                    undefined
                                                }
                                                name="p2Y12Inhibitors"
                                                error={errors.p2Y12Inhibitors}
                                                selectOptions={P2Y12_INHIBITOR_OPTIONS}
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                            <SingleCheckboxGroup
                                                label={getMsg(intl, 'calcform.form.control.rivaroxaban.label')}
                                                name="isRivaroxaban"
                                                checked={values.isRivaroxaban}
                                                error={errors.isRivaroxaban}
                                                valueHanlder={setFieldValue}
                                                disabled={props.isProcessing}
                                            />
                                        </Col>
                                    </Row>
                                </Collapse>

                                <CalcFormFooter
                                    isFormValid={isValid}
                                    isFormDirty={dirty}
                                    isFormSubmitted={state.isFormSubmitted}
                                    setFormValuesHandler={setValues}
                                    initialValues={initialValues}
                                />
                            </Col>
                        </Form>
                    </Container>
                )}
            </Formik>
        </div>
    );
}

export default CalcForm;
