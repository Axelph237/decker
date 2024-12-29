import {sliceImage} from "@/app/lib/image_slicer";

const storageURL = process.env.NEXT_PUBLIC_BUCKET_URL

export default class Deck {
    readonly uuid: string
    readonly cards: string[]
    readonly back: string


    private constructor(uuid: string, cards: string[], back: string, onload?: () => void) {
        this.uuid = uuid
        this.cards = cards
        this.back = back

        if (typeof onload === 'function') onload()
    }

    static async createDeck(uuid: string, onload?: () => void, onerr?: (err: Error) => void) {
        try {
            // Get deck data from API
            const response = await fetch(`/api/decks?deck=${encodeURIComponent(uuid)}`, {
                method: 'GET'
            })
            if (!response.ok) {
                throw new Error('Failed to fetch deck data.')
            }

            // Parse deck data
            const data = await response.json()
            const deck = data.decks[0]
            if (!deck?.deck_img_url) {
                throw new Error('No deck retrieved.')
            }

            // Slice deck atlas
            const deckImgUrl = storageURL + 'images/' + deck.deck_img_url
            const subimages = await sliceImage(deckImgUrl, deck.num_rows, deck.num_cols)

            // Set deck images
            const cards = (subimages as string[]).slice(0, deck.num_cards)
            let back;
            if (deck.has_custom_back) {
                back = storageURL + 'images/' + deck.back_img_url
            }
            else {
                back = (subimages as string[]).at(deck.num_cards)
            }

            // Create new deck
            return new Deck(uuid, cards, back as string, onload)
        }
        catch (error) {
            if (error instanceof Error && onerr) {
                onerr(error)
            }
            else {
                throw error
            }
        }
    }

    getCard = (index: number) => {
        if (!this.cards || (index >= this.cards.length || index < 0)) {
            return null
        }

        return this.cards[index]
    }


}