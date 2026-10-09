import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  ThumbsUp,
  Mail,
  Plus,
  Check,
  MoreVertical,
  ArrowLeft,
} from "lucide-react";
import "./ChatPopup.css";

const ChatPopup = ({ onClose, socket }) => {
  const [activeTab, setActiveTab] = useState("adda");
  const [messages, setMessages] = useState([]);
  const [groups, setGroups] = useState([]);
  const [inputText, setInputText] = useState("");
  const [groupNameInput, setGroupNameInput] = useState("");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [myUserId, setMyUserId] = useState(null);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [isClosingCreateGroup, setIsClosingCreateGroup] = useState(false);

  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isClosingGroupOptions, setIsClosingGroupOptions] = useState(false);
  const [activeGroupChatId, setActiveGroupChatId] = useState(null);
  const [groupInputText, setGroupInputText] = useState("");

  const [selectedUserForInvite, setSelectedUserForInvite] = useState(null);
  const [invites, setInvites] = useState([]);
  const isGuest = !localStorage.getItem("pujoUser");

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state?.view !== "chat-popup") {
        setShowCreateGroup(false);
        setSelectedGroup(null);
        setActiveGroupChatId(null);
        setSelectedUserForInvite(null);
      }
    };
    window.addEventListener("popstate", handlePopState);

    if (window.history.state?.view !== "chat-popup") {
      setShowCreateGroup(false);
      setSelectedGroup(null);
      setActiveGroupChatId(null);
      setSelectedUserForInvite(null);
    }
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const pushChatPopupState = () => {
    window.history.pushState({ view: "chat-popup" }, "");
  };

  const popChatPopupState = () => {
    if (window.history.state?.view === "chat-popup") {
      window.history.back();
    }
  };

  // Auto-scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCloseCreateGroup = () => {
    setIsClosingCreateGroup(true);
    setTimeout(() => {
      setShowCreateGroup(false);
      setIsClosingCreateGroup(false);
      setGroupNameInput("");
      popChatPopupState();
    }, 300);
  };

  const handleCloseGroupOptions = (skipPopState = false) => {
    setIsClosingGroupOptions(true);
    setTimeout(() => {
      setSelectedGroup(null);
      setIsClosingGroupOptions(false);
      if (!skipPopState) popChatPopupState();
    }, 300);
  };

  const handleCreateGroupSubmit = () => {
    if (!groupNameInput.trim()) return;
    socket.emit("createGroup", groupNameInput);
    handleCloseCreateGroup();
  };

  const handleJoinGroupSubmit = () => {
    if (!joinCodeInput.trim()) return;
    const joinedGroupsCount = groups.filter(
      (g) =>
        g.creatorId !== myUserId && g.members && g.members.includes(myUserId),
    ).length;
    if (joinedGroupsCount >= 3) {
      alert("You can only join up to 3 groups created by others.");
      return;
    }
    socket.emit("joinGroup", joinCodeInput.trim());
    setJoinCodeInput("");
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, activeTab]);

  useEffect(() => {
    if (!socket) return;

    const handleInitChat = (data) => {
      setMyUserId(data.myUserId);
      setMessages(data.messages);
    };

    const handleNewMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleChatCleared = () => {
      setMessages([]);
    };

    const handleChatError = (err) => {
      alert(err);
    };

    const handleInitGroups = (data) => {
      setGroups(data);
    };

    const handleNewGroup = (newGroup) => {
      setGroups((prev) => [...prev, newGroup]);
    };

    const handleGroupUpdated = (updatedGroup) => {
      setGroups((prev) =>
        prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)),
      );
    };

    const handleGroupDeleted = (deletedGroupId) => {
      setGroups((prev) => prev.filter((g) => g.id !== deletedGroupId));
    };

    const handleNewGroupMessage = ({ groupId, message }) => {
      setGroups((prev) =>
        prev.map((g) => {
          if (g.id === groupId) {
            return { ...g, messages: [...(g.messages || []), message] };
          }
          return g;
        }),
      );
    };

    const handleReceiveGroupInvite = (inviteData) => {
      if (inviteData.targetUserId === myUserId) {
        setInvites((prev) => {
          if (prev.length >= 3) {
            return prev;
          }
          return [...prev, inviteData];
        });
      }
    };

    socket.on("initChat", handleInitChat);
    socket.on("newMessage", handleNewMessage);
    socket.on("chatCleared", handleChatCleared);
    socket.on("chatError", handleChatError);
    socket.on("initGroups", handleInitGroups);
    socket.on("newGroup", handleNewGroup);
    socket.on("groupUpdated", handleGroupUpdated);
    socket.on("groupDeleted", handleGroupDeleted);
    socket.on("newGroupMessage", handleNewGroupMessage);
    socket.on("receiveGroupInvite", handleReceiveGroupInvite);

    // Request initial chat state since we might have missed the initial connection event
    socket.emit("requestInitChat");

    return () => {
      socket.off("initChat", handleInitChat);
      socket.off("newMessage", handleNewMessage);
      socket.off("chatCleared", handleChatCleared);
      socket.off("chatError", handleChatError);
      socket.off("initGroups", handleInitGroups);
      socket.off("newGroup", handleNewGroup);
      socket.off("groupUpdated", handleGroupUpdated);
      socket.off("groupDeleted", handleGroupDeleted);
      socket.off("newGroupMessage", handleNewGroupMessage);
      socket.off("receiveGroupInvite", handleReceiveGroupInvite);
    };
  }, [socket, myUserId]);

  const sendMessage = () => {
    if (!inputText.trim() || !socket) return;

    const words = inputText.trim().split(/\s+/);
    if (words.length > 50) {
      alert(
        "একটি বার্তায় ৫০টি শব্দের বেশি লেখা যাবে না। (Maximum 50 words allowed)",
      );
      return;
    }

    socket.emit("sendMessage", inputText);
    setInputText("");
  };

  const sendLike = () => {
    if (!socket) return;
    socket.emit("sendMessage", "👍");
  };

  const sendGroupMessage = () => {
    if (!groupInputText.trim() || !socket || !activeGroupChatId) return;

    const words = groupInputText.trim().split(/\s+/);
    if (words.length > 50) {
      alert(
        "একটি বার্তায় ৫০টি শব্দের বেশি লেখা যাবে না। (Maximum 50 words allowed)",
      );
      return;
    }

    socket.emit("sendGroupMessage", {
      groupId: activeGroupChatId,
      text: groupInputText,
    });
    setGroupInputText("");
  };

  const sendGroupLike = () => {
    if (!socket || !activeGroupChatId) return;
    socket.emit("sendGroupMessage", { groupId: activeGroupChatId, text: "👍" });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      if (activeGroupChatId) {
        sendGroupMessage();
      } else {
        sendMessage();
      }
    }
  };

  const handleInputChange = (e) => {
    const text = e.target.value;
    if (activeGroupChatId) {
      setGroupInputText(text);
    } else {
      setInputText(text);
    }
  };

  return (
    <div className="chat-popup-overlay">
      <div className="chat-popup-container">
        {/* Header Section */}
        <div className="chat-popup-header">
          <div className="chat-popup-header-top">
            {activeGroupChatId ? (
              <>
                <button
                  className="chat-close-btn"
                  style={{ left: 0, right: "auto" }}
                  onClick={() => {
                    setActiveGroupChatId(null);
                    popChatPopupState();
                  }}
                >
                  <ArrowLeft size={24} />
                </button>
                <h2
                  className="chat-popup-title-text bengali-text"
                  style={{ margin: 0, padding: "0 40px 6px 40px" }}
                >
                  {groups.find((g) => g.id === activeGroupChatId)?.name ||
                    "Group Chat"}
                </h2>
              </>
            ) : (
              <h2 className="chat-popup-title-text bengali-text">
                পূজার আড্ডা
              </h2>
            )}
            <button className="chat-close-btn" onClick={onClose}>
              <X size={24} />
            </button>
          </div>
        </div>

        {isGuest && (
          <div
            style={{
              position: "absolute",
              top: "70px",
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "rgba(0,0,0,0.2)",
            }}
          >
            <div
              className="bengali-text"
              style={{
                background: "#33221c",
                padding: "15px 30px",
                borderRadius: "25px",
                color: "#ffb366",
                fontWeight: "bold",
                fontSize: "18px",
                border: "1px solid #ff8a00",
                boxShadow: "0 4px 15px rgba(0,0,0,0.5)",
                zIndex: 11,
              }}
            >
              Log in করুন Chat পরিষেবার জন্য
            </div>
          </div>
        )}

        <div
          style={
            isGuest
              ? {
                  filter: "blur(6px)",
                  pointerEvents: "none",
                  userSelect: "none",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }
              : {
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }
          }
        >
          {!activeGroupChatId && (
            <div className="chat-popup-tabs-container">
              <div className="chat-popup-tabs bengali-text animation-pop-in">
                <button
                  className={`chat-tab-btn-modern ${activeTab === "adda" ? "active" : ""}`}
                  onClick={() => setActiveTab("adda")}
                >
                  আড্ডা
                </button>
                <button
                  className={`chat-tab-btn-modern ${activeTab === "group_adda" ? "active" : ""}`}
                  onClick={() => setActiveTab("group_adda")}
                >
                  গ্রুপ আড্ডা
                </button>
              </div>
              <div className="chat-popup-tabs bengali-text animation-pop-in">
                <button
                  className={`chat-invite-btn ${activeTab === "invite" ? "active" : ""}`}
                  onClick={() => setActiveTab("invite")}
                >
                  <Mail size={16} />
                  আমন্ত্রণ
                </button>
              </div>
            </div>
          )}
          <div className="chat-warning-message bengali-text">
            <marquee scrollamount="4">
              বিজ্ঞপ্তি : অশ্লীল ভাষা, গালিগালাজ, কুরুচিপূর্ণ মন্তব্য এবং
              যৌনতাপূর্ণ ভাষা ব্যবহার কঠোরভাবে নিষিদ্ধ। অন্য ব্যবহারকারীদের
              প্রতি যেকোনো ধরনের হেনস্থা, বিদ্বেষমূলক বক্তব্য বা হুমকি দেওয়ার
              মতো আচরণ করলে স্থায়ীভাবে ব্লক করা হবে।
            </marquee>
          </div>

          {/* Content Section */}
          <div className="chat-popup-content">
            <div className="chat-messages">
              {!activeGroupChatId && activeTab === "invite" && (
                <div className="invite-section-container animation-pop-in">
                  <h3 className="invite-section-title bengali-text">
                    আমন্ত্রণ আছে?
                  </h3>
                  <div className="invite-section-card">
                    <p className="invite-section-text">
                      Got a code from a friend? Join their group to see everyone
                      live.
                    </p>
                    <input
                      type="text"
                      placeholder="Enter Group Code"
                      className="invite-code-input"
                      value={joinCodeInput}
                      onChange={(e) => setJoinCodeInput(e.target.value)}
                    />
                    <button
                      className="invite-join-btn"
                      onClick={handleJoinGroupSubmit}
                    >
                      Join Group
                    </button>
                  </div>

                  {invites.length > 0 && (
                    <div style={{ marginTop: "24px", width: "100%" }}>
                      <h3
                        className="invite-section-title bengali-text"
                        style={{ fontSize: "15px" }}
                      >
                        গ্রুপ আমন্ত্রণ এসেছে 👉
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "12px",
                          width: "100%",
                        }}
                      >
                        {invites.map((invite, index) => (
                          <div
                            key={index}
                            className="invite-section-card"
                            style={{
                              display: "flex",
                              flexDirection: "row",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "16px 20px",
                            }}
                          >
                            <div>
                              <div
                                style={{
                                  color: "#fff",
                                  fontSize: "14px",
                                  fontWeight: "bold",
                                }}
                              >
                                {invite.groupName}
                              </div>
                              <div style={{ color: "#aaa", fontSize: "12px" }}>
                                from {invite.fromUserName}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "8px" }}>
                              <button
                                style={{
                                  background: "#f9a826",
                                  color: "#000",
                                  border: "none",
                                  padding: "6px 12px",
                                  borderRadius: "16px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  socket.emit("joinGroup", invite.groupId);
                                  setInvites((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  );
                                }}
                              >
                                Join
                              </button>
                              <button
                                style={{
                                  background: "transparent",
                                  color: "#aaa",
                                  border: "1px solid #aaa",
                                  padding: "6px 12px",
                                  borderRadius: "16px",
                                  fontWeight: "bold",
                                  cursor: "pointer",
                                }}
                                onClick={() => {
                                  setInvites((prev) =>
                                    prev.filter((_, i) => i !== index),
                                  );
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {!activeGroupChatId &&
                activeTab === "adda" &&
                messages.length === 0 && (
                  <div className="chat-content-placeholder bengali-text">
                    এখনও কোনো বার্তা নেই। আড্ডা শুরু করুন!
                  </div>
                )}

              {activeGroupChatId &&
                (() => {
                  const groupMessages =
                    groups.find((g) => g.id === activeGroupChatId)?.messages ||
                    [];
                  if (groupMessages.length === 0) {
                    return (
                      <div className="chat-content-placeholder bengali-text">
                        এখনও কোনো বার্তা নেই। আড্ডা শুরু করুন!
                      </div>
                    );
                  }
                  return groupMessages.map((msg) => {
                    const isMine = msg.userId === myUserId;
                    return (
                      <div
                        key={msg.id}
                        className={`chat-message-row ${isMine ? "mine" : "theirs"}`}
                      >
                        {!isMine && (
                          <img
                            src={msg.avatar}
                            alt="User Logo"
                            className="chat-avatar"
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              const currentGroup = groups.find(
                                (g) => g.id === activeGroupChatId,
                              );
                              if (
                                currentGroup &&
                                currentGroup.creatorId === myUserId
                              ) {
                                pushChatPopupState();
                                setSelectedUserForInvite({
                                  userId: msg.userId,
                                  username: msg.username,
                                  avatar: msg.avatar,
                                  mode: "kick",
                                  groupId: currentGroup.id,
                                });
                              }
                            }}
                          />
                        )}
                        <div
                          className={`chat-message-bubble ${msg.text === "👍" ? "like-message" : ""} bengali-text`}
                        >
                          {!isMine && (
                            <div className="chat-message-sender">
                              {msg.username}
                            </div>
                          )}
                          <div className="chat-message-text">{msg.text}</div>
                        </div>
                        {isMine && (
                          <img
                            src={msg.avatar}
                            alt="User Logo"
                            className="chat-avatar"
                          />
                        )}
                      </div>
                    );
                  });
                })()}

              {!activeGroupChatId &&
                activeTab === "adda" &&
                messages.map((msg) => {
                  if (msg.isSystemMessage) {
                    return (
                      <div key={msg.id} className="chat-system-message-row">
                        <span
                          className={`chat-system-message bengali-text ${msg.isTimeReminder ? "time-reminder" : ""}`}
                        >
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  const isMine = msg.userId === myUserId;
                  return (
                    <div
                      key={msg.id}
                      className={`chat-message-row ${isMine ? "mine" : "theirs"}`}
                    >
                      {!isMine && (
                        <img
                          src={msg.avatar}
                          alt="User Logo"
                          className="chat-avatar"
                          style={{ cursor: "pointer" }}
                          onClick={() => {
                            pushChatPopupState();
                            setSelectedUserForInvite({
                              userId: msg.userId,
                              username: msg.username,
                              avatar: msg.avatar,
                            });
                          }}
                        />
                      )}
                      <div className="chat-bubble-wrapper">
                        <div className="chat-bubble bengali-text">
                          {msg.text}
                        </div>
                      </div>
                      {isMine && (
                        <img
                          src={msg.avatar}
                          alt="User Logo"
                          className="chat-avatar"
                        />
                      )}
                    </div>
                  );
                })}
              {!activeGroupChatId && activeTab === "group_adda" && (
                <>
                  <div className="groups-list">
                    {groups
                      .filter((g) => g.members && g.members.includes(myUserId))
                      .map((group) => (
                        <div
                          key={group.id}
                          className="group-list-item"
                          onClick={() => {
                            pushChatPopupState();
                            setActiveGroupChatId(group.id);
                          }}
                        >
                          <img
                            src="/group-icon.jpg"
                            alt="group icon"
                            className="group-list-item-icon"
                          />
                          <div className="group-list-item-details">
                            <div className="group-list-item-name">
                              {group.name}
                            </div>
                            <div className="group-list-item-meta">
                              <img
                                src={group.creatorAvatar}
                                alt="creator"
                                className="group-list-item-avatar"
                              />
                              {group.membersCount} of 3 members
                            </div>
                          </div>
                          <div
                            className="group-list-item-more"
                            onClick={(e) => {
                              e.stopPropagation();
                              pushChatPopupState();
                              setSelectedGroup(group);
                            }}
                          >
                            <MoreVertical size={16} />
                          </div>
                        </div>
                      ))}
                  </div>

                  <button
                    className="chat-fab-btn animation-pop-in"
                    onClick={() => {
                      const myGroupsCount = groups.filter(
                        (g) => g.creatorId === myUserId,
                      ).length;
                      if (myGroupsCount >= 3) {
                        alert("You can only create up to 3 groups at a time.");
                        return;
                      }
                      pushChatPopupState();
                      setShowCreateGroup(true);
                    }}
                  >
                    <Plus size={24} />
                  </button>

                  {showCreateGroup && (
                    <div
                      className={`create-group-modal-overlay ${isClosingCreateGroup ? "fade-out" : "fade-in"}`}
                      onClick={handleCloseCreateGroup}
                    >
                      <div
                        className={`create-group-modal ${isClosingCreateGroup ? "slide-down" : "slide-up"}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="create-group-modal-header">
                          <h3>Create a group</h3>
                        </div>

                        <div className="create-group-info">
                          A group holds up to <strong>3 members</strong>{" "}
                          (including you), and you can have 3 groups of your own
                          at a time.
                        </div>

                        <div className="create-group-input-section">
                          <label>Group name</label>
                          <input
                            type="text"
                            placeholder="North Kolkata Tour"
                            value={groupNameInput}
                            onChange={(e) => setGroupNameInput(e.target.value)}
                          />
                        </div>

                        <button
                          className="create-group-submit-btn"
                          onClick={handleCreateGroupSubmit}
                        >
                          Create group
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedGroup && (
                    <div
                      className={`create-group-modal-overlay ${isClosingGroupOptions ? "fade-out" : "fade-in"}`}
                      onClick={handleCloseGroupOptions}
                    >
                      <div
                        className={`create-group-modal group-options-modal ${isClosingGroupOptions ? "slide-down" : "slide-up"}`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="group-options-header">
                          <img
                            src="/group-icon.jpg"
                            alt="group icon"
                            className="group-options-icon"
                          />
                          <div className="group-options-header-text">
                            <h4>{selectedGroup.name}</h4>
                            <span>
                              {selectedGroup.membersCount} member
                              {selectedGroup.membersCount !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>

                        <div className="group-options-divider"></div>

                        <button
                          className="group-options-btn"
                          onClick={() => {
                            setActiveGroupChatId(selectedGroup.id);
                            handleCloseGroupOptions(true);
                          }}
                        >
                          Open group
                        </button>

                        <div className="group-options-divider"></div>

                        <div
                          className="group-options-row"
                          onClick={() => {
                            if (navigator.clipboard && window.isSecureContext) {
                              navigator.clipboard
                                .writeText(selectedGroup.id)
                                .then(() => alert("Invite code copied!"))
                                .catch(() =>
                                  alert(
                                    "Could not copy automatically. Code is: " +
                                      selectedGroup.id,
                                  ),
                                );
                            } else {
                              // Fallback for non-HTTPS (like mobile testing on local network)
                              const textArea =
                                document.createElement("textarea");
                              textArea.value = selectedGroup.id;
                              document.body.appendChild(textArea);
                              textArea.focus();
                              textArea.select();
                              try {
                                document.execCommand("copy");
                                alert("Invite code copied!");
                              } catch (err) {
                                alert(
                                  "Could not copy automatically. Code is: " +
                                    selectedGroup.id,
                                );
                              }
                              document.body.removeChild(textArea);
                            }
                          }}
                        >
                          <span
                            className="group-options-label"
                            style={{ cursor: "pointer" }}
                          >
                            Copy invite code
                          </span>
                          <div className="group-options-code-box">
                            {selectedGroup.id}
                          </div>
                        </div>

                        <div className="group-options-divider"></div>

                        <button
                          className="group-options-btn delete-btn"
                          onClick={() => {
                            if (selectedGroup.creatorId === myUserId) {
                              socket.emit("deleteGroup", selectedGroup.id);
                            } else {
                              socket.emit("leaveGroup", selectedGroup.id);
                            }
                            handleCloseGroupOptions();
                          }}
                        >
                          {selectedGroup.creatorId === myUserId
                            ? "Delete group"
                            : "Leave group"}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {activeTab === "adda" && <div ref={messagesEndRef} />}
            </div>

            {!activeGroupChatId && activeTab === "adda" && (
              <div className="chat-input-area">
                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    placeholder="বার্তা লিখুন... (Max 50 words)"
                    className="chat-input-field bengali-text"
                    value={inputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="chat-send-btn" onClick={sendMessage}>
                    <Send size={18} />
                  </button>
                </div>
                <button className="chat-like-btn" onClick={sendLike}>
                  <ThumbsUp size={24} color="#1877F2" fill="#1877F2" />
                </button>
              </div>
            )}

            {activeGroupChatId && (
              <div className="chat-input-area">
                <div className="chat-input-wrapper">
                  <input
                    type="text"
                    placeholder="বার্তা লিখুন... (Max 50 words)"
                    className="chat-input-field bengali-text"
                    value={groupInputText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                  <button className="chat-send-btn" onClick={sendGroupMessage}>
                    <Send size={18} />
                  </button>
                </div>
                <button className="chat-like-btn" onClick={sendGroupLike}>
                  <ThumbsUp size={24} color="#1877F2" fill="#1877F2" />
                </button>
              </div>
            )}
          </div>

          {selectedUserForInvite && (
            <div
              className="user-invite-modal-overlay fade-in"
              onClick={() => {
                setSelectedUserForInvite(null);
                popChatPopupState();
              }}
            >
              <div
                className="user-invite-modal animation-pop-in"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="user-invite-content bengali-text">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <img
                      src={selectedUserForInvite.avatar}
                      alt="User Avatar"
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        objectFit: "cover",
                      }}
                    />
                    <span>
                      {selectedUserForInvite.mode === "kick"
                        ? "বিতাড়িত করুন"
                        : "গ্রুপ আমন্ত্রণ পাঠান"}
                    </span>
                  </div>
                  <div className="user-invite-actions">
                    <button
                      className="user-invite-btn-plus"
                      onClick={() => {
                        if (selectedUserForInvite.mode === "kick") {
                          socket.emit("kickUser", {
                            targetUserId: selectedUserForInvite.userId,
                            groupId: selectedUserForInvite.groupId,
                          });
                          alert("User removed successfully!");
                        } else {
                          const myGroups = groups.filter(
                            (g) => g.creatorId === myUserId,
                          );
                          if (myGroups.length === 0) {
                            alert(
                              "You need to create a group first to send an invite.",
                            );
                          } else {
                            socket.emit("sendGroupInvite", {
                              targetUserId: selectedUserForInvite.userId,
                              groupId: myGroups[0].id,
                            });
                            alert("Invite sent successfully!");
                          }
                        }
                        setSelectedUserForInvite(null);
                        popChatPopupState();
                      }}
                    >
                      {selectedUserForInvite.mode === "kick" ? (
                        <Check size={18} />
                      ) : (
                        <Plus size={18} />
                      )}
                    </button>
                    <button
                      className="user-invite-btn-close"
                      onClick={() => {
                        setSelectedUserForInvite(null);
                        popChatPopupState();
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPopup;
