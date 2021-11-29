import React, {useEffect, useState} from 'react';
import styles from './ScrollButton.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';

interface ScrollButtonProps {
    targetId: string,
}

library.add(faChevronDown);

function ScrollButton(props: ScrollButtonProps) {
    const [isDisplayed, setIsDisplayed] = useState(true);

    useEffect(() => {
        window.addEventListener('scroll', scrollHandler);
        return () => {
            // unsubscribe event
            window.removeEventListener("scroll", scrollHandler);
        };
    },[]);

    const clickHandler = () => {
        const { targetId } = props;
        let targetDiv = document.getElementById(`${targetId}`);
        if (targetDiv !== null && targetDiv !== undefined) {
            targetDiv.scrollIntoView({behavior: "smooth"});
        }
    };

    const scrollHandler = () => {
        const maxScrollHeight = document.body.offsetHeight - window.innerHeight;
        if (window.pageYOffset <= maxScrollHeight - 200) {
            setIsDisplayed(true);
        } else {
            setIsDisplayed(false);
        }
    };

    return (
        <>
            {
                isDisplayed &&
                <div className={styles.scrollButton} onClick={clickHandler}>
                    <FontAwesomeIcon icon='chevron-down'/>
                </div>
            }
        </>
    );
}

export default ScrollButton;
