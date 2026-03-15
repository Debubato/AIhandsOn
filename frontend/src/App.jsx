import { useState } from "react"

function highlightCorrection(original, corrected){

  const o = original.split(" ")
  const c = corrected.split(" ")

  return c.map((word,i)=>{

    if(o[i] !== word){
      return <span style={{color:"red"}} key={i}>{word} </span>
    }

    return <span key={i}>{word} </span>

  })
}

function App() {

  const [messages,setMessages] = useState([])
  const [input,setInput] = useState("")
  const [topics,setTopics] = useState([])

  const sendMessage = async () => {

    if(!input) return

    const res = await fetch("http://127.0.0.1:8000/chat",{
      method:"POST",
      headers:{ "Content-Type":"application/json"},
      body:JSON.stringify({text:input})
    })

    const data = await res.json()

    setMessages(prev => [
      ...prev,
      {
        role:"user",
        content:input
      },
      {
        role:"assistant",
        content:data.corrected,
        mistakes:data.mistakes
      }
    ])

    setInput("")
  }

  const getTopic = async () => {

    const res = await fetch("http://127.0.0.1:8000/topic")
    const data = await res.json()

    setTopics(prev => [data.topic,...prev])
   
  }

  const handleKeyDown = (e) => {
    if(e.key === "Enter"){
      sendMessage()
    }
  }

  return (

    <div style={{
      display:"flex",
      height:"100vh",
      background:"#343541",
      color:"white"
    }}>

      {/* sidebar */}

      <div style={{
        width:"260px",
        background:"#202123",
        padding:"15px"
      }}>

        <h3>Topics</h3>

        <button
          onClick={getTopic}
          style={{
            width:"100%",
            marginBottom:"15px"
          }}
        >
          Random Topic
        </button>

        {topics.map((t,i)=>(
          <div
            key={i}
            style={{
              borderBottom:"1px solid #444",
              padding:"8px",
              fontSize:"14px"
            }}
          >
            {t}
          </div>
        ))}

      </div>

      {/* chat area */}

      <div style={{
        flex:1,
        display:"flex",
        flexDirection:"column"
      }}>

        {/* messages */}

        <div style={{
          flex:1,
          overflowY:"scroll",
          padding:"30px"
        }}>

          {messages.map((m,i)=>(
            <div
              key={i}
              style={{
                marginBottom:"20px",
                display:"flex",
                flexDirection:"column",
                alignItems:
                  m.role==="user"?"flex-end":"flex-start"
              }}
            >

              <div style={{
                background:
                  m.role==="user"
                  ? "#19c37d"
                  : "#444654",
                padding:"12px",
                borderRadius:"10px",
                maxWidth:"600px"
              }}>

               {m.role === "assistant"
                 ? highlightCorrection(messages[i-1]?.content || "", m.content)
               : m.content}

              </div>

              {/* mistakes explanation */}

              {m.mistakes && m.mistakes.map((mistake,j)=>(
                <div
                  key={j}
                  style={{
                    marginTop:"6px",
                    background:"#2f2f2f",
                    padding:"8px",
                    borderRadius:"6px",
                    fontSize:"14px",
                    maxWidth:"600px"
                  }}
                >

                  <div>
                    <b>{mistake.original}</b> → <b>{mistake.correction}</b>
                  </div>

                  <div>
                    {mistake.explanation}
                  </div>

                </div>
              ))}

            </div>
          ))}

        </div>

        {/* input */}

        <div style={{
          padding:"20px",
          borderTop:"1px solid #555"
        }}>

          <input
            value={input}
            onChange={(e)=>setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your English..."
            style={{
              width:"80%",
              padding:"10px",
              marginRight:"10px"
            }}
          />

          <button onClick={sendMessage}>
            Send
          </button>

        </div>

      </div>

    </div>

  )

}

export default App