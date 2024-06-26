// @ts-nocheck

/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
import 'server-only'

import {
  createAI,
  createStreamableUI,
  getMutableAIState,
  getAIState,
  createStreamableValue
} from 'ai/rsc'

import { openai } from '@ai-sdk/openai';
import { BotCard, BotMessage } from '@/components/stocks'
import { nanoid, sleep } from '@/lib/utils'
import { saveChat } from '@/app/actions'
import { SpinnerMessage, UserMessage } from '@/components/stocks/message'
import { Chat } from '../types'
import { auth } from '@/auth'
import { FlightStatus } from '@/components/flights/flight-status'
import { SelectSeats } from '@/components/flights/select-seats'
import { ListFlights } from '@/components/flights/list-flights'
import { BoardingPass } from '@/components/flights/boarding-pass'
import { PurchaseTickets } from '@/components/flights/purchase-ticket'
import { CheckIcon, SpinnerIcon } from '@/components/ui/icons'
import { format } from 'date-fns'
import { experimental_streamText } from 'ai'
import { google } from 'ai/google'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { z } from 'zod'
import { ListHotels } from '@/components/hotels/list-hotels'
import { Destinations } from '@/components/flights/destinations'
import { Video } from '@/components/media/video'
import { rateLimit } from './ratelimit'
import { stringify } from 'querystring';
const fs = require('fs');
export const maxDuration = 60;
const genAI = new GoogleGenerativeAI(
    process.env.GOOGLE_GENERATIVE_AI_API_KEY || ''
)

function encodeFileToBase64(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

async function describeImage(imageBase64: string) {
  'use server'

  await rateLimit()

  const aiState = getMutableAIState()
  const spinnerStream = createStreamableUI(null)
  const messageStream = createStreamableUI(null)
  const uiStream = createStreamableUI()

  uiStream.update(
      <BotCard>
        <Video isLoading />
      </BotCard>
  )
  ;(async () => {
    try {
      let text = ''

      // attachment as video for demo purposes,
      // add your implementation here to support
      // video as input for prompts.
      if (imageBase64 === '') {
        await new Promise(resolve => setTimeout(resolve, 5000))
      } else {
        const imageData = imageBase64.split(',')[1]

        const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro-preview-0514" })
        const prompt = 'List the books in this image.'
        const image = {
          inlineData: {
            data: imageData,
            mimeType: 'image/png'
          }
        }

        const result = await model.generateContent([prompt, image])
        text = result.response.text()
      }

      spinnerStream.done(null)
      messageStream.done(null)

      uiStream.done(
          <BotCard>
            <Video />
          </BotCard>
      )

      aiState.done({
        ...aiState.get(),
        interactions: [text]
      })
    } catch (e) {
      console.error(e)

      const error = new Error(
          'The AI got rate limited, please try again later.'
      )
      uiStream.error(error)
      spinnerStream.error(error)
      messageStream.error(error)
      aiState.done()
    }
  })()

  return {
    id: nanoid(),
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value
  }
}

let conversationHistory = ''
async function submitUserMessage(content: string) {
  'use server'

  await rateLimit()
  const aiState = getMutableAIState()

  conversationHistory += `User: ${content}\n\n`;
  const newContent = `${conversationHistory}\n\nUser: ${content}`
  console.log(aiState.get().messages)
  aiState.update({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        id: nanoid(),
        role: 'user',
        content: conversationHistory
      }
    ]
  })

  const history = aiState.get().messages.map(message => ({
    role: message.role,
    content: message.content
  }))


  // console.log(conversationHistory)


  const textStream = createStreamableValue('')
  const spinnerStream = createStreamableUI(<SpinnerMessage />)
  const messageStream = createStreamableUI(null)
  const uiStream = createStreamableUI()

  ;await (async () => {

    try {
      const result = await experimental_streamText({
        model: google.generativeAI('models/gemini-1.0-pro-001'),
        temperature: 0,
        system: `You are a helpful assistant`,
        messages: [...history]
      })

      let textContent = ''
      spinnerStream.done(null)

      for await (const delta of result.fullStream) {
        const {type} = delta

        if (type === 'text-delta') {
          const {textDelta} = delta

          textContent += textDelta
          messageStream.update(<BotMessage content={textContent}/>)

          aiState.update({
            ...aiState.get(),
            messages: [
              ...aiState.get().messages,
              {
                id: nanoid(),
                role: 'assistant',
                content: textContent
              }
            ]
          })
        } else if (type === 'tool-call') {
          const {toolName, args} = delta
          // Handle the 'noteCard' tool call
          if (toolName === 'noteCard') {
            // Assuming you have a component <NoteCard> that takes props 'notes' and 'mode'
            uiStream.update(
                <BotCard>
                  <p>yolo</p>
                </BotCard>
            );

            // Append or overwrite the content in the aiState as per the mode
            let updatedNotes = args.mode === 'append' ? [...aiState.get().interactions, ...args.notes] : args.notes;

            aiState.done({
              ...aiState.get(),
              interactions: updatedNotes,
              messages: [
                ...aiState.get().messages,
                {
                  id: nanoid(),
                  role: 'assistant',
                  content: `I have taken some notes in my memory.`,
                  display: {
                    name: 'noteCard',
                    props: {
                      notes: updatedNotes,
                      mode: args.mode
                    }
                  }
                }
              ]
            });
          }
        }
      }

      uiStream.done()
      textStream.done()
      messageStream.done()
    } catch (e) {
      console.error(e)

      const error = new Error(
          'The AI got rate limited, please try again later.'
      )
      uiStream.error(error)
      textStream.error(error)
      messageStream.error(error)
      aiState.done()
    }
  })()

  return {
    id: nanoid(),
    attachments: uiStream.value,
    spinner: spinnerStream.value,
    display: messageStream.value
  }
}

export async function requestCode() {
  'use server'

  const aiState = getMutableAIState()

  aiState.done({
    ...aiState.get(),
    messages: [
      ...aiState.get().messages,
      {
        role: 'assistant',
        content:
            "A code has been sent to user's phone. They should enter it in the user interface to continue."
      }
    ]
  })

  const ui = createStreamableUI(
          <div className="animate-spin">
            <SpinnerIcon />
          </div>
      )

  ;(async () => {
    await sleep(2000)
    ui.done()
  })()

  return {
    status: 'requires_code',
    display: ui.value
  }
}

export async function validateCode() {
  'use server'

  const aiState = getMutableAIState()

  const status = createStreamableValue('in_progress')
  const ui = createStreamableUI(
          <div className="flex flex-col items-center justify-center gap-3 p-6 text-zinc-500">
            <div className="animate-spin">
              <SpinnerIcon />
            </div>
            <div className="text-sm text-zinc-500">
              Please wait while we fulfill your order.
            </div>
          </div>
      )

  ;(async () => {
    await sleep(2000)

    ui.done(
        <div className="flex flex-col items-center text-center justify-center gap-3 p-4 text-emerald-700">
          <CheckIcon />
          <div>Payment Succeeded</div>
          <div className="text-sm text-zinc-600">
            Thanks for your purchase! You will receive an email confirmation
            shortly.
          </div>
        </div>
    )

    aiState.done({
      ...aiState.get(),
      messages: [
        ...aiState.get().messages.slice(0, -1),
        {
          role: 'assistant',
          content: 'The purchase has completed successfully.'
        }
      ]
    })

    status.done('completed')
  })()

  return {
    status: status.value,
    display: ui.value
  }
}

export type Message = {
  role: 'user' | 'assistant' | 'system' | 'function' | 'data' | 'tool'
  content: string
  id?: string
  name?: string
  display?: {
    name: string
    props: Record<string, any>
  }
}

export type AIState = {
  chatId: string
  interactions?: string[]
  messages: Message[]
}

export type UIState = {
  id: string
  display: React.ReactNode
  spinner?: React.ReactNode
  attachments?: React.ReactNode
}[]

export const AI = createAI<AIState, UIState>({
  actions: {
    submitUserMessage,
    requestCode,
    validateCode,
    describeImage
  },
  initialUIState: [],
  initialAIState: { chatId: nanoid(), interactions: [], messages: [] },
  unstable_onGetUIState: async () => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const aiState = getAIState()

      if (aiState) {
        const uiState = getUIStateFromAIState(aiState)
        return uiState
      }
    } else {
      return
    }
  },
  unstable_onSetAIState: async ({ state }) => {
    'use server'

    const session = await auth()

    if (session && session.user) {
      const { chatId, messages } = state

      const createdAt = new Date()
      const userId = session.user.id as string
      const path = `/chat/${chatId}`
      const title = messages[0].content.substring(0, 100)

      const chat: Chat = {
        id: chatId,
        title,
        userId,
        createdAt,
        messages,
        path
      }

      await saveChat(chat)
    } else {
      return
    }
  }
})

export const getUIStateFromAIState = (aiState: Chat) => {
  return aiState.messages
      .filter(message => message.role !== 'system')
      .map((message, index) => ({
        id: `${aiState.chatId}-${index}`,
        display:
            message.role === 'assistant' ? (
                message.display?.name === 'showFlights' ? (
                    <BotCard>
                      <ListFlights summary={message.display.props.summary} />
                    </BotCard>
                ) : message.display?.name === 'showSeatPicker' ? (
                    <BotCard>
                      <SelectSeats summary={message.display.props.summary} />
                    </BotCard>
                ) : message.display?.name === 'showHotels' ? (
                    <BotCard>
                      <ListHotels />
                    </BotCard>
                ) : message.content === 'The purchase has completed successfully.' ? (
                    <BotCard>
                      <PurchaseTickets status="expired" />
                    </BotCard>
                ) : message.display?.name === 'showBoardingPass' ? (
                    <BotCard>
                      <BoardingPass summary={message.display.props.summary} />
                    </BotCard>
                ) : message.display?.name === 'listDestinations' ? (
                    <BotCard>
                      <Destinations destinations={message.display.props.destinations} />
                    </BotCard>
                ) : (
                    <BotMessage content={message.content} />
                )
            ) : message.role === 'user' ? (
                <UserMessage showAvatar>{message.content}</UserMessage>
            ) : (
                <BotMessage content={message.content} />
            )
      }))
}
