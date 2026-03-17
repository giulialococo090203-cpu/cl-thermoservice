import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const url =
    "https://wa.me/393662085556?text=" +
    encodeURIComponent("Ciao! Avrei bisogno di assistenza, potete aiutarmi?");

  return (
    <>
      <a
        className="waFab"
        href={url}
        target="_blank"
        rel="noreferrer"
        aria-label="Contattaci su WhatsApp"
      >
        <MessageCircle size={24} />
      </a>
      <div className="waHint">Scrivici su WhatsApp</div>
    </>
  );
}