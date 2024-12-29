'use client'

import {useEffect, useState} from "react";
import './Table.css'
import Deck from "@/app/lib/deck";

interface Card {
    name?: string,
    imgURL?: string,
}

const CARD_DIMS = 'min-w-32 min-h-32 max-w-96 max-h-96 w-fit h-fit'

export default function Table({ deck }: { deck: Deck }) {
    const [drawPile, setDrawPile] = useState<Card[]>([]);
    const [discardPile, setDiscardPile] = useState<Card[]>([])
    const [hand, setHand] = useState<Card[]>([])

    const [selectedCard, setSelectedCard] = useState<number>(0);

    useEffect(() => {
        // TODO initialize to current game state rather than full deck
        const cards = deck.cards.map((value, index) => {
            return {
                name: `Card ${index}`,
                imgURL: value,
            }
        })
        setDrawPile(cards)
        console.log('Cards loaded:', cards)
    }, [])

    const handleCardClick = (index: number) => {
        setSelectedCard(index);

        console.log('Selected', index)

        handleDiscard(index)
    }

    const handleDraw =  () => {
        if (drawPile.length <= 0) return;

        const drawIndex = Math.round(Math.random() * (drawPile.length - 1))

        const newCard = drawPile[drawIndex]
        setHand([...hand, newCard])

        const newDrawPile = drawPile
        newDrawPile.splice(drawIndex, 1)
        setDrawPile(newDrawPile)
    }

    const handleDiscard = (index: number) => {
        setDiscardPile([...discardPile, hand[index]]) // append card to discard

        const newCards = hand
        newCards.splice(index, 1)
        setHand(newCards) // remove card from hand
    }

    return (
        <div className='flex flex-row justify-center items-center gap-72'>

            {/* DRAW PILE */}
            <div id='draw-container' onClick={() => handleDraw()}
                  className='flex flex-row items-center justify-center w-1 h-1 bg-emerald-500'>
                {drawPile.length > 0 && (
                    <div className={`card-container ${CARD_DIMS}`}>
                        <img src={deck.back} alt='Draw Pile' className='card-img'/>
                    </div>
                )}
            </div>

            {/* PLAYER HAND */}
            <div id='hand-container' className='flex flex-row w-96 h-1 justify-around items-center bg-red-900'>
                {hand.map((card, i) => <div key={i}>
                    {/* Card element */}
                    <div className={`${selectedCard == i && 'selected'} ${CARD_DIMS} card-container hand`}
                         onClick={() => handleCardClick(i)} key={i}>
                        {card.imgURL ? <img src={card.imgURL} alt={card.name} className='card-img'/> : card.name}
                    </div>
                </div>)}
            </div>

            {/* DISCARD PILE */}
            <div id='discard-container' className='flex flex-row justify-around items-center w-1 h-1 bg-violet-500'>
                {discardPile.length > 0 && (
                    <div className={`card-container ${CARD_DIMS}`}>
                        <img src={discardPile[discardPile.length - 1].imgURL} alt='Discard Pile' className='card-img'/>
                    </div>
                )}
            </div>
        </div>
    )
}