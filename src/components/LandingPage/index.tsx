import { useEffect, useState } from "react";
import styled from "styled-components";
import { Button, CircularProgress, Snackbar } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import Countdown from "react-countdown";

import './LandingPage.css'
import * as anchor from "@project-serum/anchor";

import {
    CandyMachine,
    awaitTransactionSignatureConfirmation,
    getCandyMachineState,
    mintOneToken,
    shortenAddress,
} from "../../candy-machine";


export interface LandingPage {
    candyMachineId: anchor.web3.PublicKey;
    config: anchor.web3.PublicKey;
    connection: anchor.web3.Connection;
    startDate: number;
    treasury: anchor.web3.PublicKey;
    txTimeout: number;
}

interface AlertState {
    open: boolean;
    message: string;
    severity: "success" | "info" | "warning" | "error" | undefined;
}

const ConnectButton = styled(WalletDialogButton)``;

const CounterText = styled.span``; // add your styles here

const MintContainer = styled.div``; // add your styles here

const MintButton = styled(Button)``; // add your styles here

const renderCounter = ({ days, hours, minutes, seconds, completed }: any) => {
    return (
        <CounterText>
            {hours + (days || 0) * 24} hours, {minutes} minutes, {seconds} seconds
        </CounterText>
    );
};

export default function LandingPage(props: LandingPage) {
    const [balance, setBalance] = useState<number>();
    const [isActive, setIsActive] = useState(false); // true when countdown completes
    const [isSoldOut, setIsSoldOut] = useState(false); // true when items remaining is zero
    const [isMinting, setIsMinting] = useState(false); // true when user got to press MINT

    const [itemsAvailable, setItemsAvailable] = useState(0);
    const [itemsRedeemed, setItemsRedeemed] = useState(0);
    const [itemsRemaining, setItemsRemaining] = useState(0);

    const [alertState, setAlertState] = useState<AlertState>({
        open: false,
        message: "",
        severity: undefined,
    });

    const [startDate, setStartDate] = useState(new Date(props.startDate));

    const wallet = useAnchorWallet();
    const [candyMachine, setCandyMachine] = useState<CandyMachine>();

    const refreshCandyMachineState = () => {
        (async () => {
            if (!wallet) return;

            const {
                candyMachine,
                goLiveDate,
                itemsAvailable,
                itemsRemaining,
                itemsRedeemed,
            } = await getCandyMachineState(
                wallet as anchor.Wallet,
                props.candyMachineId,
                props.connection
            );

            setItemsAvailable(itemsAvailable);
            setItemsRemaining(itemsRemaining);
            setItemsRedeemed(itemsRedeemed);

            setIsSoldOut(itemsRemaining === 0);
            setStartDate(goLiveDate);
            setCandyMachine(candyMachine);
        })();
    };

    const onMint = async () => {
        try {
            setIsMinting(true);
            if (wallet && candyMachine?.program) {
                const mintTxId = await mintOneToken(
                    candyMachine,
                    props.config,
                    wallet.publicKey,
                    props.treasury
                );

                const status = await awaitTransactionSignatureConfirmation(
                    mintTxId,
                    props.txTimeout,
                    props.connection,
                    "singleGossip",
                    false
                );

                if (!status?.err) {
                    setAlertState({
                        open: true,
                        message: "Congratulations! Mint succeeded!",
                        severity: "success",
                    });
                } else {
                    setAlertState({
                        open: true,
                        message: "Mint failed! Please try again!",
                        severity: "error",
                    });
                }
            }
        } catch (error: any) {
            // TODO: blech:
            let message = error.msg || "Minting failed! Please try again!";
            if (!error.msg) {
                if (error.message.indexOf("0x138")) {
                } else if (error.message.indexOf("0x137")) {
                    message = `SOLD OUT!`;
                } else if (error.message.indexOf("0x135")) {
                    message = `Insufficient funds to mint. Please fund your wallet.`;
                }
            } else {
                if (error.code === 311) {
                    message = `SOLD OUT!`;
                    setIsSoldOut(true);
                } else if (error.code === 312) {
                    message = `Minting period hasn't started yet.`;
                }
            }

            setAlertState({
                open: true,
                message,
                severity: "error",
            });
        } finally {
            if (wallet) {
                const balance = await props.connection.getBalance(wallet.publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
            }
            setIsMinting(false);
            refreshCandyMachineState();
        }
    };

    useEffect(() => {
        (async () => {
            if (wallet) {
                const balance = await props.connection.getBalance(wallet.publicKey);
                setBalance(balance / LAMPORTS_PER_SOL);
            }
        })();
    }, [wallet, props.connection]);

    useEffect(refreshCandyMachineState, [
        wallet,
        props.candyMachineId,
        props.connection,
    ]);


    return (
        <div className="landing_page">
            <title>Not Not Larva Labs</title>
            <meta name="description" content="Generated by create next app" />
            <link rel="icon" href="/favicon.ico" />
            <link href="https://fonts.googleapis.com/css2?family=Montserrat&display=swap" rel="stylesheet" />
            <div className="content">
                <div className="header">
                    <img src="/static/logo.svg" alt="Not Not Larva Labs Logo" width={160} height={104} />
                    <div className="header_action_links">
                        <h1 className="header_item">About</h1>
                        <h1 className="header_item">FAQ/History</h1>
                        <h1 className="header_item">Marketplace</h1>
                        <img className="header_item" src="/static/twitter.svg" alt="Twitter Logo" width={20} height={17} />
                                                {wallet && (
                            <h1 className="wallet_short_address">
                                {shortenAddress(wallet.publicKey.toBase58() || "")}
                                <img alt="SOL" width={22} height={22} src="https://solana.com/branding/new/exchange/exchange-black.png" className="MuiAvatar-img"></img>
                                {(balance || 0).toLocaleString()}
                            </h1>
                        )}

                        {!wallet ? <ConnectButton>Connect Wallet</ConnectButton> : null}
                    </div>


                        <Snackbar
                            open={alertState.open}
                            autoHideDuration={6000}
                            onClose={() => setAlertState({ ...alertState, open: false })}
                        >
                            <Alert
                                onClose={() => setAlertState({ ...alertState, open: false })}
                                severity={alertState.severity}
                            >
                                {alertState.message}
                            </Alert>
                        </Snackbar>
                </div>

                <main className="main">
                    <div className="main_left_content">
                        <h1 className="main_left_header">{"Hi! We're "}<br />{"Not Not Larva Labs."}</h1>
                        <p className="main_left_content_text">{"We don't have lawyers cause that's lame, but we thought we should put something here to"}<br />{"remind you that we are, in fact, definitely not Not Larva Labs."}</p>
                        <button className="main_button">More About Us</button>
                    </div>
                    <div className="main_right_content">
                        <img src="/static/main_logo.svg" alt="Not Not Larva Labs Main Logo" width={298} height={189} />
                        <div>
                            {/* {wallet && <p>Balance: {(balance || 0).toLocaleString()} SOL</p>} */}

                            {wallet && <p>Total Available: {itemsAvailable}</p>}

                            {wallet && <p>Redeemed: {itemsRedeemed}</p>}

                            {wallet && <p>Remaining: {itemsRemaining}</p>}

                            {wallet ?
                                <MintContainer>
                                    <MintButton
                                        disabled={isSoldOut || isMinting || !isActive}
                                        onClick={onMint}
                                        variant="contained"
                                    >
                                        {isSoldOut ? (
                                            "SOLD OUT"
                                        ) : isActive ? (
                                            isMinting ? (
                                                <CircularProgress />
                                            ) : (
                                                "MINT"
                                            )
                                        ) : (
                                            <Countdown
                                                date={startDate}
                                                onMount={({ completed }) => completed && setIsActive(true)}
                                                onComplete={() => setIsActive(true)}
                                                renderer={renderCounter}
                                            />
                                        )}
                                    </MintButton>
                                </MintContainer>
                                : null}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

