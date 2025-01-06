import {useEffect, useState} from 'react';

const useTimer = (props) => {
  const [remains, setRemains] = useState(0);

  useEffect(() => {
    let intervalId;
    if (remains !== 0) {
      intervalId = setInterval(() => {
        if (remains !== 0) {
          setRemains(remains - 1)
        }
      }, 1000)
    }
    return () => clearInterval(intervalId);
  }, [remains]);

  return {
    remains: remains,
    reloadTimer: () => {setRemains(props.seconds);},
  }
}

useTimer.props = {
  seconds: undefined,
}

export default useTimer;