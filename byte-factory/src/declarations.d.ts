declare module '*.css';

declare module '*.png' {
    const imageUrl: string;
    export default imageUrl;
}
