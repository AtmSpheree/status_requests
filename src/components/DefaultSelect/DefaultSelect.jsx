import styles from './DefaultSelect.module.css'
import {useEffect, useState} from "react";
import makeId from "../../utils/makeId.js";

const DefaultSelect = (props) => {
  const [value, setValue] = useState(props.innerLabel ?? (props.value ?? props.options[0]));
  const selectId = props.selectId ?? makeId(5);
  const [isInnerLabel, setIsInnerLabel] = useState(props.innerLabel !== undefined)

  useEffect(() => {
    if (props.value !== undefined) {
      console.log(props.value)
      setValue(props.value)
    }
  }, [props.value]);

  return (<div className={styles.default_select_container} style={props.styles ?? {}}>
    <label
      className={styles.default_select_label}
      htmlFor={selectId}
    >
      {props.label ?? "Поле для ввода"}
    </label>
    <div
      className={styles.custom_select}
    >
      <select
        id={selectId}
        value={value}
        onChange={(e) => {
          setIsInnerLabel(false)
          if (props.onChange) {
            let result = props.onChange(e.target.value);
            if (!result) {
              setValue(e.target.value)
            }
          } else {
            setValue(e.target.value)
          }
        }}
        style={props.selectStyles ?? {}}
        required={props.isRequired ?? false}
      >
        {isInnerLabel &&
          <option>
            {props.innerLabel}
          </option>
        }
        {props.options.map((item) => (
          <option
            key={item}
          >
            {item}
          </option>
        ))}
      </select>
    </div>
  </div>)
}

DefaultSelect.props = {
  label: undefined,
  options: [],
  onChange: undefined,
  isRequired: undefined,
  styles: undefined,
  selectStyles: undefined,
  innerLabel: undefined,
  selectId: undefined,
  value: undefined,
}

export default DefaultSelect;