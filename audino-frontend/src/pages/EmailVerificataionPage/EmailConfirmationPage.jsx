import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";

export default function EmailConfirmationPage() {
  const linkRef = useRef(null);
  const Ref = useRef(null);

  // The state for our timer
  const [timer, setTimer] = useState("00:00:00");

  const getTimeRemaining = (e) => {
    const total = Date.parse(e) - Date.parse(new Date());
    const seconds = Math.floor((total / 1000) % 60);
    const minutes = Math.floor((total / 1000 / 60) % 60);
    const hours = Math.floor((total / 1000 / 60 / 60) % 24);

    if (total < 0) {
      clearInterval(Ref.current);
      linkRef.current.click();
    }
    return {
      total,
      hours,
      minutes,
      seconds,
    };
  };

  const startTimer = (e) => {
    let { total, hours, minutes, seconds } = getTimeRemaining(e);
    if (total >= 0) {
      setTimer(
        (hours > 9 ? hours : "0" + hours) +
          ":" +
          (minutes > 9 ? minutes : "0" + minutes) +
          ":" +
          (seconds > 9 ? seconds : "0" + seconds)
      );
    }
  };

  const clearTimer = (e) => {
    setTimer("00:00:05");

    if (Ref.current) {
      clearInterval(Ref.current);
    }
    const id = setInterval(() => {
      startTimer(e);
    }, 1000);
    Ref.current = id;
  };

  const getDeadTime = () => {
    let deadline = new Date();

    deadline.setSeconds(deadline.getSeconds() + 5);
    return deadline;
  };

  useEffect(() => {
    clearTimer(getDeadTime());
  }, []);

  return (
    <div className="flex min-h-screen flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8 bg-primary-background bg-center bg-no-repeat bg-cover">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <img
          className="mx-auto h-14 w-auto"
          src={require("../../assets/logos/logo.png")}
          alt="Audino"
        />
        <div className="mt-6 text-center tracking-tight text-gray-900">
          <h2 className="text-2xl leading-9 font-bold">
            Your email is confirmed
          </h2>
          <p>Redirecting to login page after {timer}</p>
          <p className="mt-10 text-center text-sm text-gray-500">
            <NavLink
              ref={linkRef}
              to="/login"
              className="font-semibold leading-6 text-audino-primary hover:text-audino-primary-dark"
            >
              Go to login page
            </NavLink>
          </p>
        </div>
      </div>
    </div>
  );
}
