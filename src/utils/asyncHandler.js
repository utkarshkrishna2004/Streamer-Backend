/*
--> IF WE WANT TO HANDLE USING PROMISES ⬇️
*/

const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) =>
            next(err)
        );
    };
};

export { asyncHandler };





/*
--> IF WE WANT TO HANDLE USING TRY-CATCH ⬇️

const asyncHandler = (func) => async (req, res, next) => {
    try {
        await func(req, res, next);
    } catch (error) {
        res.status(error.code || 500).json({
            success: false,
            messgae: error.messgae,
        });
    }
};

----------------------------------------------------------------------------------------------
-> Just to understand the "const asyncHandler = (func) => async(req, res, next) => {}" part...

    const asyncHandler = () => {}
    const asyncHandler = (func) => { () => {} }
    const asyncHandler = (func) => () => {}
    const asyncHandler = (func) => async() => {}
----------------------------------------------------------------------------------------------
*/
