import React from "react";
import styles from "./Chat.module.css";
import MessageBox from "../components/MessageBox";
import Logo from "../components/Logo";
export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
      history: [],
      is_partner_typing: false
    };
  }

  componentDidMount() {
    const socket = this.props.socket;
    socket.on("send_message", ({ user, message }) => {
      this.store_message(user, message);
    });

    //Typing indicator
    socket.on("typing", ({ value }) => {
      this.setState({ is_partner_typing: value });
    });
  }

  store_message = (user, message, new_state = {}) => {
    let new_history = this.state.history.slice(); // Copy history array as state is supposed to be immutable
    new_history.push({ user, message });
    this.setState({ history: new_history, ...new_state });
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
    this.store_message(socket.id, message, { message: "" });
    this.props.socket.emit("typing", {
      to: this.props.partner_id,
      value: false
    });
  };

  on_typing = e => {
    this.setState({ message: e.target.value });
    this.props.socket.emit("typing", {
      to: this.props.partner_id,
      value: true
    });
  };

  render() {
    return (
      <React.Fragment>
        <Logo />
        <p className={styles.connection}>
          {!this.state.is_partner_typing
            ? `Connected to: ${this.props.partner_handle}`
            : `${this.props.partner_handle} is typing...`}
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
            onChange={this.on_typing}
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
