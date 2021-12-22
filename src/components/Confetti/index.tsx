import { CreateTypes } from "canvas-confetti";
import React, { Component } from "react";
import ReactCanvasConfetti from "react-canvas-confetti";

import "./Confetti.css";

type Props = {
  count: number;
};

type State = {
  count: number;
};

export default class Confetti extends Component<Props, State> {
  private animationInstance: CreateTypes | null = null;

  constructor(props: Props) {
    super(props);
    this.fire = this.fire.bind(this);

    this.state = {
      count: props.count,
    };
  }

  componentDidUpdate(prevProps: Props) {
    if (this.props.count !== prevProps.count) {
      this.fire();
    }
  }

  makeShot(particleRatio: number, opts: object) {
    this.animationInstance &&
      this.animationInstance({
        ...opts,
        origin: { y: 0.7 },
        particleCount: Math.floor(200 * particleRatio),
      });
  }

  fire() {
    this.makeShot(0.25, {
      spread: 26,
      startVelocity: 55,
    });

    this.makeShot(0.2, {
      spread: 60,
    });

    this.makeShot(0.35, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8,
    });

    this.makeShot(0.1, {
      spread: 120,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2,
    });

    this.makeShot(0.1, {
      spread: 120,
      startVelocity: 45,
    });
  }

  handlerFire = () => {
    this.fire();
  };

  getInstance = (instance: CreateTypes | null) => {
    this.animationInstance = instance;
  };

  render() {
    return (
      <>
        <div className="confetti-container">
          <ReactCanvasConfetti
            refConfetti={this.getInstance}
            className="confetti-canvas"
            height={500}
            width={700}
          />
        </div>
      </>
    );
  }
}
