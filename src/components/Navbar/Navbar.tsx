import React from 'react';
import cx from 'classnames';
import styles from './Navbar.module.scss';
import {useIntl} from 'react-intl';

interface NavbarProps {
    activeTabIndex: number,
    onActiveTabIndexUpdate: (tabIndex: number) => void
}

const Navbar = ({activeTabIndex, onActiveTabIndexUpdate}: NavbarProps) => {
    const intl = useIntl()

    const resolveActivenessStyle = (tabIndex: number): any => {
        return activeTabIndex === tabIndex ? styles.active : styles.default
    };

    return (
        <div className={styles.container}>
            <input
                type="button"
                name="nav_tabs"
                className={cx(styles.tab, styles.one, resolveActivenessStyle(0))}
                onClick={() => onActiveTabIndexUpdate(0)}
                value={intl.formatMessage({id: 'navbar.tabOne'})}
            />
            <input
                type="button"
                name="nav_tabs"
                className={cx(styles.tab, styles.two, resolveActivenessStyle(1))}
                onClick={() => onActiveTabIndexUpdate(1)}
                value={intl.formatMessage({id: 'navbar.tabTwo'})}
            />
            <input
                type="button"
                name="nav_tabs"
                className={cx(styles.tab, styles.three, resolveActivenessStyle(2))}
                onClick={() => onActiveTabIndexUpdate(2)}
                value={intl.formatMessage({id: 'navbar.tabThree'})}
            />
        </div>
    );
}

export default Navbar;
