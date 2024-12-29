'use client'

import Table from "@/app/game/Table";
import {useEffect, useState} from "react";
import Deck from "@/app/lib/deck";

/*
    Data needed to run a game (fetched by server for page loading):
    Game id
    Game settings
    Deck id -> to get deck image (deck image held at highest level)
    Players

    Cacheable data:
    Game id
    Deck image
 */

interface GameManagerProps {
    game: {
        uuid: string,
        settings: {
            deckUUID: string
        }
    }
}


export default function GameManager({ game }: GameManagerProps) {
    const [gameSettings, setGameSettings] = useState(undefined)
    const [deck, setDeck] = useState<Deck | undefined>(undefined)

    useEffect(() => {
        Deck.createDeck(game.settings.deckUUID)
            .then((deck) => setDeck(deck))
            .catch((e) => console.log(e))
    }, [])

    return (
        <div className='w-screen h-screen box-border flex flex-col justify-center'>
            {deck && <Table deck={deck} />}
        </div>
    )
}