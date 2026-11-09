// Demo storage only: data URLs are not private object storage or signed URLs.
export function readIncidentImage(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) return Promise.reject(new Error("Vui lòng chọn tệp ảnh."));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Không thể đọc ảnh."));
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("Không thể đọc ảnh."));
    reader.readAsDataURL(file);
  });
}
