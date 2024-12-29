import GameManager from "@/app/game/GameManager";
import {v4 as uuidv4} from "uuid";

export default async function GamePage() {

    const deckUUID = '426b0b3c-82c7-4f22-828a-8e97749cf86a'

    return (
        <div>
            <GameManager game={{
                uuid: uuidv4(), // TODO Make actual game id rather than random uuid
                settings: { deckUUID }
            }} />
        </div>
    )
}