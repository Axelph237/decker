export default async function DevPage() {
    const blackBox = (<div className='h-12 w-12 bg-white border-red-500 border-2 flex flex-row items-center justify-center'>
        <div className='h-1 w-1 bg-red-500'></div>
    </div>)

    const cardBox = (<div className='h-12 w-12 bg-white border-blue-500 border-2 flex flex-row items-center justify-center'>
        <div className='absolute h-64 w-40 bg-blue-500 border-2 border-white rounded-lg'></div>
    </div>)

    return (
        <div className='w-screen h-screen flex flex-row items-center justify-center'>
            <div className='w-96 h-24 bg-white flex flex-row around items-center justify-around'>
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
                {cardBox}
            </div>
        </div>
    )
}