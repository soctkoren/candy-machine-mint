import { useEffect, useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import { getCandyMachineState } from "../../candy-machine";
import * as anchor from "@project-serum/anchor";

import "./SolPhunks.css";
import Loading from "../shared/Loading/Loading";

export interface SolPhunksPageProps {
  candyMachineId: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
}

interface ItemsProps {
  itemsRedeemed: number;
}

interface ItemProps {
  itemsRedeemed: number;
  i: number;
}

function Items(props: ItemsProps) {
  const minted = [];
  const remaining = [];
  for (let i = 0; i < 10000; i++) {
    if (props.itemsRedeemed >= i && props.itemsRedeemed !== 0) {
      minted.push(<Item itemsRedeemed={props.itemsRedeemed} i={i} />);
    } else {
      remaining.push(<Item itemsRedeemed={props.itemsRedeemed} i={i} />);
    }
  }

  function Item(props: ItemProps) {
    return (
      <div className="item-card">
        <div className="item-img">
          <LazyLoadImage
            className="lazy-img"
            src={
              props.itemsRedeemed >= props.i
                ? `/static/solphunks/${props.i}.png`
                : "/static/default.png"
            }
            width={90}
            height={90}
            placeholderSrc={"/static/default.png"}
          />
        </div>
        <p>{`#${props.i}`}</p>
      </div>
    );
  }

  return (
    <div className="items-container">
      {minted.length !== 0 ? (
        <>
          <h2 className="minted_phunk_count">Minted</h2>
          <div className="items">
            {minted.map((item) => {
              return item;
            })}
          </div>
        </>
      ) : null}
      {remaining.length !== 0 ? (
        <>
          <h2 className="remaining_phunk_count">Remaining</h2>
          <div className="items">
            {remaining.map((item) => {
              return item;
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}

const SolPhunks = (props: SolPhunksPageProps) => {
  const wallet = useAnchorWallet();
  const [itemsRedeemed, setItemsRedeemed] = useState(-1);
  const refreshCandyMachineState = () => {
    (async () => {
      if (!wallet) return;

      const { itemsRedeemed } = await getCandyMachineState(
        wallet as anchor.Wallet,
        props.candyMachineId,
        props.connection
      );
      setItemsRedeemed(itemsRedeemed);
    })();
  };

  useEffect(refreshCandyMachineState, [
    wallet,
    props.candyMachineId,
    props.connection,
  ]);
  return (
    <>
      {itemsRedeemed === -1 ? (
        wallet === undefined ? (
          <div className="connect-container">
            <h1 className="connect">
              CONNECT YOUR WALLET
              <br />
              TO YOU WANNA SEE THE GOODS
            </h1>
            <img
              className="default-mint-img"
              src="/static/default.png"
              width={300}
            />
          </div>
        ) : (
          <Loading headerLabel="LOADING" />
        )
      ) : (
        <>
          <h1 className="all_phunks">All Phunks</h1>
          <p className="phunk_count">10000 Phunks Total</p>
          <Items itemsRedeemed={itemsRedeemed} />
        </>
      )}
    </>
  );
};

export default SolPhunks;
