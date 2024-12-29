'use client'

import './DeckUpload.css'
import {ChangeEvent, Dispatch, FormEvent, SetStateAction, useEffect, useRef, useState} from "react";
import colorPicker from '@/public/color-picker.svg'
import {default as NextImage} from "next/image";
import {sliceImage} from "@/app/lib/image_slicer";

export default function DeckUpload() {
    const BORDER_WIDTH_STEP = 5;

    const rowsInputRef = useRef(null)
    const colsInputRef = useRef(null)
    const cardsInputRef = useRef(null)
    const radiusInputRef = useRef(null)
    const colorInputRef = useRef(null)
    const previewRef = useRef(null)

    const [inExampleView, setInExampleView] = useState(false)

    const [deckImg, setDeckImg] = useState<{blob: string} | undefined>(undefined)
    const [deckSettings, setDeckSettings] = useState({cols: 0, rows: 0, cards: 0})
    const [hasCustomBack, setHasCustomBack] = useState(false)
    const [backImg, setBackImg] = useState<{blob: string} | undefined>(undefined)
    const [cardImgs, setCardImgs] = useState<string[] | undefined>(undefined)
    const [previewCard, setPreviewCard] = useState<{
        frontImg: HTMLImageElement,
        backImg: HTMLImageElement
    } | undefined>(undefined)

    const [borderRounding, setBorderRounding] = useState(0)
    const [hasCustomBorder, setHasCustomBorder] = useState(false)
    const [borderColor, setBorderColor] = useState<string | undefined>(undefined)
    const [selectedBorder, setSelectedBorder] = useState(0)
    const [borderSize, setBorderSize] = useState(BORDER_WIDTH_STEP)

    const [isUploading, setIsUploading] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const radiusInput = document.getElementById('radius-range') as HTMLInputElement
        radiusInput.value = '0'
    }, []);

    useEffect(() => {
        createPreview()
    }, [cardImgs, backImg])

    const handleFileSelect = (event: ChangeEvent<HTMLInputElement>, setter: Dispatch<SetStateAction<{blob: string}| undefined>>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                if (!e.target) return;

                setter({blob: e.target.result as string})
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSettingsChange = () => {

        if (!rowsInputRef.current || !colsInputRef.current || !cardsInputRef.current) return;

        const rowsInput = rowsInputRef.current as HTMLInputElement
        const colsInput = colsInputRef.current as HTMLInputElement
        const cardsInput = cardsInputRef.current as HTMLInputElement

        let numRows = parseInt((rowsInput).value)
        let numCols = parseInt((colsInput).value)
        let numCards = parseInt((cardsInput).value)

        // Bound values below
        if (!numRows || numRows <= 0) {
            if (numRows <= 0) {
                rowsInput.value = '1'
            }

            numRows = 1
        }
        if (!numCols || numCols <= 0) {
            if (numCols <= 0) {
                colsInput.value = '1'
            }

            numCols = 1
        }
        if (!numCards || numCards <= 0) {
            if (numCards <= 0) {
                cardsInput.value = '1'
            }

            numCards = 1
        }

        // Bound the number of cards by the dims atlas
        const maxCards = numRows * numCols
        if (numCards >= maxCards) {
            if (hasCustomBack) {
                numCards = maxCards
                cardsInput.value = maxCards.toString()
            }
            else {
                numCards = maxCards - 1
                cardsInput.value = (maxCards - 1).toString()
            }
        }

        const data = {
            rows: numRows,
            cols: numCols,
            cards: numCards,
        }

        setDeckSettings(data)

        if (deckImg?.blob) {
            sliceImage(deckImg.blob, numRows, numCols)
                .then((cards) => setCardImgs(cards as string[]))
        }
    }

    const handleBackCheckboxClick = () => {
        if (hasCustomBack) {
            setBackImg(undefined)
        }

        setHasCustomBack(!hasCustomBack)
    }

    const handleBorderCheckboxClick = () => {
        setHasCustomBorder(!hasCustomBorder)
    }

    const handleSliderChange = () => {
        if (!radiusInputRef.current || !previewRef.current) return;

        const val = parseInt((radiusInputRef.current as HTMLInputElement).value)
        const frac = val / parseInt((radiusInputRef.current as HTMLInputElement).max)

        const maxDim = Math.max(
            (previewRef.current as HTMLImageElement).clientHeight,
            (previewRef.current as HTMLImageElement).clientWidth
        )
        const radius = frac * maxDim / 2

        setBorderRounding(radius)
    }

    const handleColorChange = () => {
        if (!colorInputRef.current) return;

        setBorderColor((colorInputRef.current as HTMLInputElement).value)
    }

    const handleRadiusClick = (index: number) => {
        setSelectedBorder(index)
        setBorderSize((index + 1) * BORDER_WIDTH_STEP)
    }

    const handleSubmit = (event: FormEvent) => {
        event.preventDefault()

        if (!deckImg?.blob) {
            setMessage('No image selected')
            return;
        }

        const data = {
            creatorUUID: 'empty',
            numRows: deckSettings.rows,
            numCols: deckSettings.cols,
            numCards: deckSettings.cards,
            hasCustomBack: hasCustomBack,
            deckImgData: deckImg?.blob,
            backImgData: backImg?.blob,
        }

        setIsUploading(true)
        fetch('/api/decks', {
            method: 'POST',
            body: JSON.stringify(data)
        })
            .then((response) => {
                console.log('Deck uploaded with response:', response)
            })
            .catch((error) => {
                console.log('Failed to upload deck:', error)
            })
            .finally(() => setIsUploading(false))

        fetch(deckImg.blob).then((response) => console.log('Image data:', response))
    }

    const handleReset = () => {
        setDeckImg(undefined)
        setBackImg(undefined)

        setDeckSettings({rows: 0, cols: 0, cards: 0})
        setHasCustomBack(false)
        setHasCustomBorder(false)
    }

    const createPreview = () => {
        if (!cardImgs) return;

        const frontFace = new Image()
        frontFace.src = cardImgs[0]
        frontFace.onload = () => {
            const backFace = new Image()
            // Either back is custom back image, or last sliced image
            backFace.src = backImg?.blob ? backImg.blob : cardImgs[deckSettings.cards]
            backFace.onload = () => {
                setPreviewCard({
                    frontImg: frontFace,
                    backImg: backFace
                })
            }
        }
    }


    return (
        <div className={`grid grid-cols-2 justify-center gap-4 p-12 h-screen box-border`}>
            {/* Preview */}
            <div className='preview-container mb-4 gap-2'>
                {previewCard && <div className='flip-card scale-50' style={{
                    width: previewCard.frontImg.width + 'px',
                    height: previewCard.frontImg.height + 'px',
                }}>
                    <div className='flip-card-inner'>
                        <NextImage src={previewCard.frontImg} alt='Preview Front' className='flip-card-front' style={{
                            borderRadius: `${borderRounding}px`,
                            border: `${hasCustomBorder ? borderSize : 0}px ${borderColor ? borderColor : '#ffffff'} solid`
                        }}/>
                        <NextImage src={previewCard.backImg} alt='Preview Back'  className='flip-card-back' style={{
                            borderRadius: `${borderRounding}px`,
                            border: `${hasCustomBorder ? borderSize : 0}px ${borderColor ? borderColor : '#ffffff'} solid`
                        }}/>
                    </div>
                </div>}

                {deckImg?.blob && <div className='flex flex-col items-center'>
                    <div className='grid grid-rows-1 grid-cols-1 overflow-hidden'>
                        <img src={deckImg.blob} alt='Deck Preview' className='max-h-80 row-end-1 col-end-1'
                             ref={previewRef}/>
                        <div className='grid row-end-1 col-end-1'
                             style={{gridTemplate: `repeat(${deckSettings.rows}, 1fr) / repeat(${deckSettings.cols}, 1fr)`}}>
                            {Array.from(Array(deckSettings.rows * deckSettings.cols).keys()).map(i => <div key={i}
                                                                                                           className={`preview-grid ${i >= deckSettings.cards && 'ignored'} ${(!hasCustomBack && i == deckSettings.cards) && 'back-highlight'}`}></div>)
                            }
                        </div>
                    </div>
                    {backImg?.blob && 'Deck Faces'}
                </div>}

                {backImg?.blob &&
                    <div className='flex flex-col items-center font-bold'>
                        <img src={backImg.blob} alt='Back Image' className='max-h-80 row-end-1 col-end-1' style={{
                            borderRadius: `${borderRounding}px`,
                            border: `${hasCustomBorder ? borderSize : 0}px ${borderColor ? borderColor : '#ffffff'} solid`
                        }}/>
                        Back Face
                    </div>
                }
            </div>

            {/* Input/Settings */}
            <div className='flex flex-row items-center justify-center gap-6'>
                {!deckImg
                    ? <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <label
                                className={`button px-4 py-2 rounded text-white`}
                            >
                                Deck Image
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={(event) => handleFileSelect(event, setDeckImg)}
                                />
                            </label>
                        </div>
                    </div>

                    : <div className='flex flex-col items-center'>
                        <form className='flex flex-col items-center justify-center' onSubmit={handleSubmit}>
                            <label htmlFor='deck-rows' className='flex flex-col font-bold mb-4'>
                                Rows
                                <input id='deck-rows' type='number' placeholder='1' min={1}
                                       ref={rowsInputRef} onChange={handleSettingsChange}/>
                            </label>

                            <label htmlFor='deck-cols' className='flex flex-col font-bold mb-4'>
                                Columns
                                <input id='deck-cols' type='number' placeholder='1' min={1}
                                       ref={colsInputRef} onChange={handleSettingsChange}/>
                            </label>

                            <label htmlFor='deck-cards' className='flex flex-col font-bold mb-4'>
                                Number of Cards
                                <input id='deck-cards' type='number' placeholder='1' min={1}
                                       ref={cardsInputRef} onChange={handleSettingsChange}/>
                            </label>

                            <div className='flex flex-col items-center justify-center'>
                                <div>
                                    <label htmlFor='deck-back-checkbox'
                                           className='container flex flex-row items-center font-bold mb-2 gap-2'>
                                        Separate Back Image
                                        <input id='deck-back-checkbox' type='checkbox'
                                               className='checkbox w-4 h-4 bg-red-500'
                                               onClick={handleBackCheckboxClick}/>
                                        <span className='checkmark'></span>
                                    </label>
                                </div>

                                {!hasCustomBack && <span className='mb-4 text-sm'>
                                    <span className='gradient-text'>Color face</span> will be used as back image
                                </span>}
                            </div>

                            {hasCustomBack
                                && <div className="mb-4">
                                    <div className="flex items-center">
                                        <label
                                            className={`button px-4 py-2 rounded text-white`}
                                        >
                                            {backImg ? 'Change Back' : 'Back Image'}
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(event) => handleFileSelect(event, setBackImg)}
                                            />
                                        </label>
                                    </div>
                                </div>
                            }

                        </form>
                        <button className='underline text-sm' onClick={handleReset}>
                            Reset deck
                        </button>
                    </div>

                }

                {/* Advanced Settings */}
                <div className='flex flex-col items-center'>
                    {/* Rounded Corners */}
                    <h3 className='font-bold'>Corner Rounding</h3>
                    <input type="range" min="0" max="100" className="slider mb-4" id="radius-range" ref={radiusInputRef} onChange={handleSliderChange}/>


                    {/* Border */}
                    <div>
                        <label htmlFor='border-checkbox'
                               className='container flex flex-row items-center font-bold mb-2 gap-2'>
                            Card Border
                            <input id='border-checkbox' type='checkbox'
                                   className='checkbox w-4 h-4 bg-red-500'
                                   onClick={handleBorderCheckboxClick}/>
                            <span className='checkmark'></span>
                        </label>
                    </div>

                    {/* Border Color */}
                    {hasCustomBorder &&
                        <div className='flex flex-row items-center justify-center'>
                            <label htmlFor='border-color' className='color-container mx-1'>
                                <input type='color' id='border-color' ref={colorInputRef} onChange={handleColorChange}/>
                                <div className='color-display'
                                     style={{background: borderColor ? borderColor : '#ffffff'}}>
                                    <NextImage src={colorPicker} alt='Color' className='p-1 opacity-50'/>
                                </div>
                            </label>

                            {[0, 1, 2].map((i) =>
                                <button key={i} onClick={() => handleRadiusClick(i)}
                                        className={`border-button mx-1 ${selectedBorder == i && 'selected'}`}>
                                    <div className='border-display' style={{
                                        borderWidth: `${(i + 1) * BORDER_WIDTH_STEP}px 0px 0px 0px`,
                                        borderColor: borderColor && (selectedBorder == i) ? borderColor : '#ffffff',
                                    }}></div>
                                </button>
                            )}
                        </div>
                    }
                </div>
            </div>

            <div className='fixed top-9 right-9'>
                {backImg?.blob || !hasCustomBack && deckImg
                    ? <button id='deck-submit' className='button' value='Create Deck'
                              onClick={handleSubmit} disabled={isUploading}>
                        {isUploading ? 'Uploading...' : 'Create Deck'}
                    </button>
                    : <div className='empty-button'>Create Deck</div>
                }
            </div>
        </div>
    )
}