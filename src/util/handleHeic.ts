const isHEIC = (file: File): Boolean => {
  const x = file.type ? file.type.split("image/").pop() : `${file.name.split(".").pop()}`.toLowerCase();
  return x === "heic" || x === "heif";
};

const loadScript = async (url: string) => {
  const script = document.createElement("script");
  script.type = "text/javascript";

  document.getElementsByTagName("head")[0].appendChild(script);

  return new Promise(resolve => {
    script.src = url;

    const resolveOnLoadChange = (_event: Event) => {
      script.removeEventListener("load", resolveOnLoadChange);
      resolve();
    };
    script.addEventListener("load", resolveOnLoadChange);
  });
};

const handleHeic = async (file: File): Promise<File> => {
  if (!isHEIC(file)) {
    return file;
  }

  await loadScript(`${document.location.protocol}//${document.location.host}/heic2any.min.js`);

  const heicFile = await window.heic2any({ blob: file });

  heicFile.name = file.name.substring(0, file.name.lastIndexOf(".")) + ".png";

  return heicFile;
};

export default handleHeic;
