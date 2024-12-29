import {z} from "zod";
import {supabase} from '@/app/lib/database'
import {decode} from 'base64-arraybuffer'
import {v4 as uuidv4} from "uuid";
import {NextRequest} from "next/server";

// DeckMetadata Schema for typechecking
const DeckMetadata = z.object({
    creatorUUID: z.string(),
    numRows: z.number(),
    numCols: z.number(),
    numCards: z.number(),
    hasCustomBack: z.boolean(),
    deckImgData: z.string(),
    backImgData: z.optional(z.string()),
})

/**
 * Creates a deck with the given parameters
 *
 * @param request
 * @constructor
 */
export async function POST(request: Request) {
    try {
        const md = DeckMetadata.parse(await request.json())


        const deckFilename = `public/decks/${uuidv4()}.png`
        const deckRes = await uploadFile({filename: deckFilename, data: md.deckImgData})

        let backRes = undefined
        if (md.hasCustomBack && md.backImgData) {
            const backFilename = `public/backs/${uuidv4()}.png`
            backRes = await uploadFile({filename: backFilename, data: md.backImgData})
        }

        const { data, error } = await supabase
            .from('decks')
            .insert([
                {
                    creator: uuidv4(), // TODO make actual user data
                    num_rows: md.numRows,
                    num_cols: md.numCols,
                    num_cards: md.numCards,
                    deck_img_url: deckRes.path,
                    has_custom_back: md.hasCustomBack,
                    back_img_url: backRes?.path,
                },
            ])
            .select()

        if (error) throw error

        return new Response('Image uploaded', {status: 200})
    }
    catch (e) {
        console.log('Error occurred during request:', e)
        throw e
    }
}

/**
 * Convenience method for uploading files
 * @param img - An object of the files information to upload
 */
async function uploadFile(img: {filename: string, data: string}) {

    const bytes = img.data.split(',')[1]

    const { data, error } = await supabase
        .storage
        .from('images')
        .upload(img.filename, decode(bytes), {
            contentType: 'image/png'
        })

    if (error) throw error

    return data
}


interface MetadataResponse {
    id: string,
    created_at: string,
    creator: string,
    deck_img_url: string,
    has_custom_back: boolean,
    back_img_url?: string,
    num_rows: number,
    num_cols: number,
    num_cards: number,

}

export async function GET(
    request: NextRequest
) {
    const searchParams = request.nextUrl.searchParams
    const deckUUID = searchParams.get('deck')
    const creatorUUID = searchParams.get('creator')

    if (!deckUUID && !creatorUUID) throw new Error(
        'No valid search parameters given. Please provide either a deck id, or user id.'
    )

    const query = supabase
        .from('decks')
        .select('*')

    if (deckUUID) {
        query.eq('id', deckUUID)
    }
    if (creatorUUID) {
        query.eq('creator', creatorUUID)
    }

    const { data: decks, error } = await query

    console.log('Retrieved decks:', decks)

    if (error) throw error

    return Response.json({ decks: decks as MetadataResponse[] })
}