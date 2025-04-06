import React from "react";

const MovieDetailSkelleton = ({size, ...props}) => {
  return (
    <div className={`${size} bg-[#698fa5] animate-[pulse_9s_ease-in-out_infinite] rounded-lg`}></div>
  );
};

export default MovieDetailSkelleton;
