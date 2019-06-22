import React from "react";
import styles from "./Chat.module.css";
import MessageBox from "../components/MessageBox";
import Logo from "../components/Logo";
export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      history: []
    };
  }

  componentDidMount() {
    const socket = this.props.socket;
    socket.on("send_message", ({ user, message }) => {
      this.store_message(user, message);
    });
  }

  store_message = (user, message) => {
    let new_history = this.state.history.slice(); // Copy history array as state is supposed to be immutable
    new_history.push({ user, message });
    this.setState({ history: new_history, message: "" });
  };

  send_message = () => {
    if (this.state.message.length <= 0) {
      return;
    }
    const socket = this.props.socket;
    const message = this.state.message;
    socket.emit("send_message", {
      to: this.props.partner_id,
      message
    });
    this.store_message(socket.id, message);
  };

  render() {
    return (
      <React.Fragment>
        <Logo />
        <p className={styles.connection}>
          Connected to: {this.props.partner_handle}
        </p>
        <div className={styles.messages}>
          {this.state.history.map((el, i) => (
            <MessageBox
              key={i}
              message={el.message}
              other={el.user === this.props.socket.id ? 0 : 1}
            />
          ))}
        </div>
        <div className={styles.chat_bar}>
          <input
            placeholder="To write a message"
            onChange={e => this.setState({ message: e.target.value })}
            value={this.state.message}
            onKeyDown={e => {
              if (e.keyCode === 13) this.send_message();
            }}
          />
          <button onClick={this.send_message}>Send</button>
        </div>
      </React.Fragment>
    );
  }
}
