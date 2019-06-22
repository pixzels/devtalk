import React from "react";
import styles from "./App.module.css";
import openSocket from "socket.io-client";
import Chat from "./containers/Chat";
import Loader from "./components/Loader";
import Logo from "./components/Logo";

const socket = openSocket(); // Defaults to current url

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      partner_id: null,
      handle: "",
      connection_success: false,
      initiated_connection: false
    };
  }

  componentDidMount() {
    // Register user
    socket.emit("new_user");
    socket.on("connection_success", ({ partner_id }) => {
      if (partner_id !== -1) {
        this.setState({
          partner_id,
          connection_success: true
        });
      }
    });
  }

  // Find partner
  connect = () => {
    if (this.state.handle.length === 0) {
      alert("Oops! You don't seem to have a handle. Please try again");
      return;
    }
    this.setState({
      initiated_connection: true
    });
    socket.emit("establish_connection");
  };

  render() {
    if (this.state.connection_success) {
      return (
        <div className={styles.App}>
          <Chat
            partner_id={this.state.partner_id}
            socket={socket}
            handle={this.state.handle}
          />
        </div>
      );
    } else {
      return (
        <div className={styles.App}>
          <Logo />
          <p
            style={{
              textAlign: "center"
            }}
          >
            <strong> Connect with awesome developers around the world! </strong>
          </p>
          <div className={styles.container}>
            <input
              placeholder="Handle"
              onChange={e =>
                this.setState({
                  handle: e.target.value
                })
              }
            />
            <button
              onClick={this.connect}
              disabled={this.state.initiated_connection}
            >
              Connect
            </button>
          </div>
          {this.state.initiated_connection && !this.state.connection_success ? (
            <div>
              <p className={styles.status}>
                No one is here.We 'll connect you automatically as soon as
                someone come...
              </p>
              <Loader />
            </div>
          ) : null}
          <p
            style={{
              marginTop: "10rem",
              fontSize: "1.2rem",
              textAlign: "center"
            }}
          >
            We respect your privacy and don 't store your messages in any
            manner, so you can talk freely{" "}
            <span role="img" aria-label="smily">
              🙃
            </span>
          </p>
        </div>
      );
    }
  }
}
