import React from 'react';
import styles from './PatientBanner.module.scss';
import {PatientData} from "../../services/FHIRService";
import { getMsg } from "../App/utils";
// import {useIntl} from "react-intl";

interface PatientBannerProps {
    patientData?: PatientData
    isPatientDataHidden: boolean
}

const PatientBanner = ({patientData, isPatientDataHidden}: PatientBannerProps) => {
    // const intl = null;

    const getDisplayName = (): string | undefined => {
        let firstName = patientData?.firstName;
        let lastName = patientData?.lastName;

        if (!firstName || !lastName) {
            return undefined;
        }

        firstName = firstName[0].toUpperCase() + firstName.slice(1).toLowerCase();
        lastName = lastName[0].toUpperCase() + lastName.slice(1).toLowerCase();

        return `${firstName} ${lastName}`
    };

    // "patientBanner.details": "{age} years, {gender}, {month}/{day}/{year}",
    //     "patientBanner.appTitle": "ASCVD Secondary Prevention Risk Calculator",
    //         "patientBanner.appSubtitle": "10-Year Risk Calculator for Established ASCVD (SMART-REACH)",
    //             "patientBanner.male": "Male",
    //                 "patientBanner.female": "Female",

    const getDisplayDetails = (): string | undefined => {
        const gender = patientData?.gender;
        const dateOfBirth = patientData?.dateOfBirth;
        const age = patientData?.age;

        if (!gender || !dateOfBirth) {
            return undefined;
        }

        const genderMsg = gender ?
            getMsg(null,`patientBanner.${gender}`) :
            undefined;

        const day = dateOfBirth.getDate();
        const month = dateOfBirth.getMonth() + 1;
        const year = dateOfBirth.getFullYear();

        return getMsg(null, "patientBanner.details", {
            age,
            day, month, year,
            gender: genderMsg,
        })
    };

    const patientBannerDataAvailable = (patientData: PatientData | undefined): boolean =>
        !!patientData?.firstName ||
        !!patientData?.lastName ||
        !!patientData?.gender ||
        !!patientData?.age ||
        !!patientData?.dateOfBirth;

    const appTitle = getMsg(null,  'patientBanner.appTitle');
    const appSubtitle = getMsg(null, 'patientBanner.appSubtitle');
    const patientNameStr = getDisplayName();
    const patientDetailsStr = getDisplayDetails();

    return (
        <div className={styles.container}>
            <div className={styles['application-title-container']}>
                <span className={styles.title}>{appTitle}</span>
                <br/>
                <span className={styles.subtitle}>{appSubtitle}</span>
            </div>
            <div className={isPatientDataHidden && !patientBannerDataAvailable(patientData) ?
                            styles.hidden : styles['patient-data-container']}
            >
                <span className={patientNameStr ? styles.title : styles.hidden}>{patientNameStr}</span>
                <br/>
                <span className={patientDetailsStr ? styles.subtitle : styles.hidden}>{patientDetailsStr}</span>
            </div>
        </div>
    )
};

export default PatientBanner;
