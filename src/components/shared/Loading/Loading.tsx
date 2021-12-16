import "./Loading.css";

interface LoadingProps {
  headerLabel?: string;
}

const Loading = (props: LoadingProps) => {
  return (
    <div className="loading">
      {props.headerLabel ? <h2>{props.headerLabel}</h2> : null}
      <div>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  );
};

export default Loading;
