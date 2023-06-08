export interface File {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    mimetype: string;
    label?: string;
    extension?: string;
    url: string;
    thumbnail: string;
    metadata?: any;
}
