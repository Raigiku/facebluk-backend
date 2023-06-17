// accessors
export type FnUploadProfilePicture = (userId: string, bytes: ArrayBuffer) => Promise<void>
export type FnFindProfilePictureUrl = (userId: string) => string
