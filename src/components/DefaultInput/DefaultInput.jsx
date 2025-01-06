import styles from './DefaultInput.module.css'
import makeId from "../../utils/makeId.js";
import {useEffect, useRef, useState} from "react";

const DefaultInput = (props) => {
  const [value, setValue] = useState(props.value ?? "");
  const inputId = props.inputId ?? makeId(5);
  const [isEyeHover, setIsEyeHover] = useState(false);
  const [isPasswordShown, setIsPasswordShown] = useState(false);

  useEffect(() => {
    if (props.value !== undefined) {
      setValue(props.value)
    }
  }, [props.value]);

  return (<div className={styles.default_input_container} style={props.styles ?? {}}>
    <label
      className={styles.default_input_label}
      htmlFor={inputId}
    >
      {props.label ?? "Поле для ввода"}
    </label>
    <input
      id={inputId}
      className={styles.default_input}
      placeholder={props.placeholder ?? "Заполните поле"}
      type={props.type ? (props.type === "password" ? (isPasswordShown ? "text" : "password") : props.type) : "text"}
      value={value}
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
      style={props.inputStyles ?? {}}
      maxLength={props.maxLength ?? null}
      minLength={props.minLength ?? null}
      required={props.isRequired ?? false}
    />
    {(props.type === "password" && value !== "") && (
      <img
        onMouseEnter={(e) => setIsEyeHover(true)}
        onMouseOut={(e) => setIsEyeHover(false)}
        onClick={(e) => setIsPasswordShown(!isPasswordShown)}
        className={styles.password_show_img}
        src={isPasswordShown ?
            (isEyeHover ? "/images/eye_closed__selected.svg" : "/images/eye_closed.svg")
          :
            (isEyeHover ? "/images/eye__selected.svg" : "/images/eye.svg")
        }
        alt={"Показать"}
      />
    )}
  </div>)
}

DefaultInput.props = {
  label: undefined,
  placeholder: undefined,
  type: undefined,
  onChange: undefined,
  isRequired: undefined,
  styles: undefined,
  inputStyles: undefined,
  inputId: undefined,
  maxLength: undefined,
  minlength: undefined,
  value: undefined,
}

export default DefaultInput