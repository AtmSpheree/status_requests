import styles from './DefaultCheckbox.module.css'
import makeId from "../../utils/makeId.js";
import {useEffect, useState} from "react";

const DefaultCheckbox = (props) => {
  const inputId = props.inputId ?? makeId(5);
  const [value, setValue] = useState(props.checked ?? false);

  useEffect(() => {
    if (props.checked !== undefined) {
      setValue(props.checked)
    }
  }, [props.checked]);

  return (<div className={styles.default_checkbox_container} style={props.styles ?? {}}>
    <input
      id={inputId}
      type="checkbox"
      checked={value}
      className={styles.default_checkbox}
      style={{pointerEvents: "none"}}
      onChange={(e) => {
        setValue(e.target.checked);
        if (props.onChange) {
          props.onChange(e.target.checked)
        }
      }}
    />
    <label
      htmlFor={inputId}
      style={{
        pointerEvents: props.isUserCheckable === undefined ? "auto" : (props.isUserCheckable ? "auto" : "none"),
        "--default-checkbox-color": props.color ?? "var(--main-color-palette_accent)"
      }}
    >
    </label>
    <label
      className={styles.default_checkbox_label}
      htmlFor={inputId}
      style={{
        pointerEvents: props.isUserCheckable === undefined ? "auto" : (props.isUserCheckable ? "auto" : "none"),
        "--default-checkbox-color": props.color ?? "var(--main-color-palette_text__black)"
      }}
    >
      {props.label ?? "Чекбокс"}
    </label>
  </div>)
}

DefaultCheckbox.props = {
  label: undefined,
  onChange: undefined,
  inputId: undefined,
  isUserCheckable: undefined,
  checked: undefined,
  color: undefined,
  styles: undefined,
}

export default DefaultCheckbox;