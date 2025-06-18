import React from 'react';
import './Messages.css';

const conversations = [
  {
    name: 'Nguyễn Văn An',
    online: true,
    unread: 2,
    lastMessage: 'Cảm ơn coach đã tư vấn hôm qua. Em cảm thấy tự tin hơn rất nhiều!',
    messages: [
      { from: 'client', text: 'Chào coach! Em muốn hỏi về cách đối phó với cơn thèm thuốc lá vào buổi sáng ạ!', time: '09:30' },
      { from: 'coach', text: 'Chào An! Cơn thèm buổi sáng là rất phổ biến. Mình có một vài gợi ý cho bạn: 1. Thay thế thói quen: thay vì hút thuốc, hãy uống một cốc nước hoặc trà. 2. Tập thở sâu 5-10 lần. 3. Đi bộ nhẹ hoặc tập thể dục. Bạn có thể thử áp dụng và cho mình biết kết quả nhé!', time: '09:35' },
      { from: 'client', text: 'Cảm ơn coach! Em sẽ thử ngay từ mai. Còn về việc tăng cân khi cai thuốc thì sao ạ?', time: '09:40' }
    ]
  },
  {
    name: 'Trần Thị Bình',
    online: false,
    unread: 5,
    lastMessage: 'Coach ơi, em đang cảm thấy khó khăn quá. Có thể chat không?',
    messages: []
  },
  {
    name: 'Lê Hoàng Cường',
    online: true,
    unread: 0,
    lastMessage: 'Tuần này em đã giảm được 50% rồi coach!',
    messages: []
  }
];

function Messages() {
  const [selected, setSelected] = React.useState(0);
  const conv = conversations[selected];
  return (
    <div className="messages-container">
      <div className="messages-list">
        <h4>Cuộc trò chuyện</h4>
        {conversations.map((c,idx)=>(
          <div key={idx} onClick={()=>setSelected(idx)} className={"messages-list-item" + (selected===idx ? " selected" : "") }>
            <div className="messages-avatar">{c.name.split(' ').map(w=>w[0]).join('')}</div>
            <div style={{flex:1}}>
              <div style={{fontWeight:'bold'}}>{c.name} {c.online && <span style={{color:'#22c55e',fontSize:12}}>&#9679;</span>}</div>
              <div style={{fontSize:12,color:'#888'}}>{c.lastMessage.slice(0,32)}...</div>
            </div>
            {c.unread > 0 && <span className="unread">{c.unread}</span>}
          </div>
        ))}
      </div>
      <div className="messages-chat">
        <div className="messages-chat-header">{conv.name} {conv.online && <span style={{color:'#22c55e',fontSize:12}}>&#9679; Đang online</span>}</div>
        <div className="messages-chat-body">
          {conv.messages.length === 0 ? <div style={{color:'#888'}}>Chưa có tin nhắn...</div> : conv.messages.map((m,i)=>(
            <div key={i} className={"messages-chat-message "+(m.from==='coach'?'coach':'client')}>
              <div className="bubble">{m.text}</div>
              <div style={{fontSize:10,color:'#888'}}>{m.time}</div>
            </div>
          ))}
        </div>
        <div className="messages-chat-footer">
          <input type="text" placeholder="Nhập tin nhắn..." />
          <button>Gửi</button>
        </div>
      </div>
    </div>
  );
}

export default Messages;
