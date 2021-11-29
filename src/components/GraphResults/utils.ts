import pattern from "patternomaly";

export const resolveITPaintPattern = (isDashed: boolean = true): any =>
    isDashed ? pattern.draw('diagonal-right-left', '#fdfdfd', '#3179B9') : '#3179B9'
