import React from 'react'
import type { TicketMessage } from '../../utils/types'
import IntialsImage, { Intials } from './IntialsImage'

export default function TicketHistory({ data }: { data: TicketMessage[]}) {
  return (
    <div className="flex-col-2" style={{ width: "100%", marginTop: "3rem" }}>
        <h4 className="form--title">Ticket History</h4>
      
        <div className="ticket--messages">
            {data?.map((message, index) => (
                <div className="message--container" key={index} style={message?.sender_type !== "agent" ? { gridTemplateColumns: "1fr 4rem" } : {}}>
                    {message?.sender_type === "agent" ? (
                        <React.Fragment>
                            <Intials
                                hasImage={!!message?.sender_image}
                                imageUrl={message?.sender_image}
                                names={[message?.sender_name]}
                            />
                            <span className="message--card">
                                {message?.message}
                                <aside>{message?.created_at}</aside>
                            </span>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <span className="message--card">
                                <span dangerouslySetInnerHTML={{ __html: message?.message }} />
                                <aside>{message?.created_at}</aside>
                            </span>
                            <IntialsImage />
                        </React.Fragment>
                    )}
                </div>
            ))}
        </div>
    </div>
  )
}
