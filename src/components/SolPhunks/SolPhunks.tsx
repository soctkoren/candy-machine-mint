import { LazyLoadImage } from "react-lazy-load-image-component";

import "./SolPhunks.css";

function Items() {
  const items = [];
  for (let i = 0; i < 10000; i++) {
    items.push(
      <div className="item-card">
        <div className="item-img">
          <LazyLoadImage
            className="lazy-img"
            src={`/static/solphunks/${i}.png`}
            width={90}
            height={90}
            placeholderSrc={"/static/default.png"}
          />
        </div>
        <p>{`#${i}`}</p>
      </div>
    );
  }

  return (
    <div className="items">
      {items.map((item) => {
        return item;
      })}
    </div>
  );
}

function getStaticUrl(name: String) {}

const SolPhunks = () => {
  const items = Items();
  return (
    <>
      <h1 className="all_phunks">All Phunks</h1>
      <p className="phunk_count">10000 Phunks Total</p>
      <Items />
    </>
  );
};

export default SolPhunks;
