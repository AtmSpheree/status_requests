import styles from './DefaultTextarea.module.css'
import {useState} from "react";
import makeId from "../../utils/makeId.js";

const DefaultTextarea = (props) => {
  const [value, setValue] = useState("");
  const textareaId = props.textareaId ?? makeId(5);

  return (<div className={styles.default_textarea_container} style={props.styles ?? {}}>
    <label
      className={styles.default_textarea_label}
      htmlFor={textareaId}
    >
      {props.label ?? "Поле для ввода"}
    </label>
    <textarea
      id={props.textareaId}
      className={styles.default_textarea}
      onChange={(e) => {
        if (props.onChange) {
          let result = props.onChange(e.target.value);
          if (!result) {
            setValue(e.target.value)
          }
        } else {
          setValue(e.target.value)
        }
      }}
      maxLength={props.maxLength ?? null}
      minLength={props.minLength ?? null}
      style={props.textareaStyles ?? {}}
      required={props.isRequired ?? false}
    >
      {value}
    </textarea>
  </div>)
}

DefaultTextarea.props = {
  label: undefined,
  onChange: undefined,
  isRequired: undefined,
  styles: undefined,
  textareaStyles: undefined,
  textareaId: undefined,
  maxLength: undefined,
  minlength: undefined,
}

export default DefaultTextarea;