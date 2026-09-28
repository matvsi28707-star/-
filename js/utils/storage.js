export const storage = {
    get(key, fallback = null){
        const raw = localStorage.getItem(key);
        if(raw === null) return fallback;
        try{
            return JSON.parse(raw)
        } catch{
            return raw;
        }
    },
    set(key, value){
        localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value))
    },
    remove(key){
        localStorage.removeItem(key)
    }
}