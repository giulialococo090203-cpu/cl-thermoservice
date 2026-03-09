export default function PrivacyPolicy() {
  const sectionStyle = {
    padding: "80px 0",
    background: "#ffffff",
    color: "#0f172a",
  };

  const containerStyle = {
    width: "min(900px, 92vw)",
    margin: "0 auto",
    lineHeight: 1.75,
  };

  const h1Style = {
    fontSize: "clamp(32px, 5vw, 44px)",
    fontWeight: 900,
    letterSpacing: "-0.03em",
    margin: 0,
  };

  const h2Style = {
    marginTop: 34,
    marginBottom: 10,
    fontSize: 24,
    fontWeight: 800,
    letterSpacing: "-0.02em",
  };

  const pStyle = {
    margin: "10px 0",
    fontSize: 16,
    color: "#334155",
  };

  const ulStyle = {
    margin: "10px 0 0 18px",
    color: "#334155",
    padding: 0,
  };

  const liStyle = {
    margin: "8px 0",
  };

  return (
    <section style={sectionStyle}>
      <div style={containerStyle}>
        <h1 style={h1Style}>Privacy Policy</h1>

        <p style={{ ...pStyle, marginTop: 20 }}>
          Informativa sul trattamento dei dati personali ai sensi del Regolamento
          (UE) 2016/679 (“GDPR”).
        </p>

        <h2 style={h2Style}>1. Titolare del trattamento</h2>
        <p style={pStyle}>
          Il Titolare del trattamento è <strong>CL. Thermoservice S.r.l.</strong>
          <br />
          Sede: Via Tommaso Calojra 36, Palermo
          <br />
          P.IVA: 06441430821
          <br />
          Email: clthermoservice@virgilio.it
          <br />
          Tel: 091406911
        </p>

        <h2 style={h2Style}>2. Tipologie di dati raccolti</h2>
        <p style={pStyle}>
          Attraverso il presente sito possono essere raccolti i seguenti dati personali:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>nome e cognome;</li>
          <li style={liStyle}>numero di telefono;</li>
          <li style={liStyle}>indirizzo email;</li>
          <li style={liStyle}>contenuto del messaggio inviato dall’utente;</li>
          <li style={liStyle}>
            eventuali dati inseriti volontariamente nelle richieste di contatto o di preventivo;
          </li>
          <li style={liStyle}>
            dati tecnici di navigazione, raccolti in modo automatico dai sistemi informatici
            e di sicurezza del sito.
          </li>
        </ul>

        <h2 style={h2Style}>3. Modalità di raccolta dei dati</h2>
        <p style={pStyle}>
          I dati personali sono raccolti quando l’utente:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>compila il modulo di richiesta preventivo;</li>
          <li style={liStyle}>contatta l’azienda tramite i recapiti presenti sul sito;</li>
          <li style={liStyle}>interagisce con eventuali link esterni, come WhatsApp o email;</li>
          <li style={liStyle}>naviga sulle pagine del sito.</li>
        </ul>

        <h2 style={h2Style}>4. Finalità del trattamento</h2>
        <p style={pStyle}>
          I dati personali sono trattati per le seguenti finalità:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            rispondere a richieste di informazioni, assistenza o contatto;
          </li>
          <li style={liStyle}>
            gestire richieste di preventivo e comunicazioni precontrattuali;
          </li>
          <li style={liStyle}>
            organizzare eventuali sopralluoghi, interventi o ricontatti commerciali richiesti dall’utente;
          </li>
          <li style={liStyle}>
            garantire il corretto funzionamento tecnico, la sicurezza e la protezione del sito;
          </li>
          <li style={liStyle}>
            adempiere ad obblighi di legge, fiscali o amministrativi, ove applicabili.
          </li>
        </ul>

        <h2 style={h2Style}>5. Base giuridica del trattamento</h2>
        <p style={pStyle}>
          Il trattamento dei dati personali si fonda, a seconda dei casi, sulle seguenti basi giuridiche:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>esecuzione di misure precontrattuali</strong>, quando l’utente invia una richiesta
            di informazioni o preventivo;
          </li>
          <li style={liStyle}>
            <strong>adempimento di obblighi legali</strong>, quando il trattamento è necessario
            per obblighi previsti dalla normativa;
          </li>
          <li style={liStyle}>
            <strong>legittimo interesse del Titolare</strong>, limitatamente alla sicurezza del sito,
            prevenzione di abusi e gestione tecnica della piattaforma;
          </li>
          <li style={liStyle}>
            <strong>consenso dell’interessato</strong>, ove richiesto dalla normativa applicabile.
          </li>
        </ul>

        <h2 style={h2Style}>6. Natura del conferimento dei dati</h2>
        <p style={pStyle}>
          Il conferimento dei dati richiesti nei moduli di contatto o preventivo è facoltativo,
          ma il mancato inserimento dei dati contrassegnati come necessari può rendere impossibile
          rispondere alla richiesta o fornire il servizio richiesto.
        </p>

        <h2 style={h2Style}>7. Modalità del trattamento</h2>
        <p style={pStyle}>
          Il trattamento avviene con strumenti elettronici e, ove necessario, anche con modalità
          manuali, secondo principi di liceità, correttezza, trasparenza e minimizzazione,
          adottando misure di sicurezza adeguate a proteggere i dati personali.
        </p>

        <h2 style={h2Style}>8. Destinatari dei dati e terze parti</h2>
        <p style={pStyle}>
          I dati personali potranno essere trattati, nei limiti delle finalità sopra indicate,
          da soggetti autorizzati dal Titolare e da fornitori di servizi strettamente connessi
          alla gestione del sito e delle richieste ricevute.
        </p>
        <p style={pStyle}>
          In particolare, i dati possono essere resi accessibili a categorie di soggetti quali:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>fornitori di hosting, infrastruttura cloud o database;</li>
          <li style={liStyle}>fornitori di servizi tecnici e manutenzione del sito;</li>
          <li style={liStyle}>consulenti informatici o amministrativi, ove necessario;</li>
          <li style={liStyle}>
            eventuali fornitori di servizi esterni richiamati dal sito, come mappe, video o canali di contatto.
          </li>
        </ul>
        <p style={pStyle}>
          Tali soggetti trattano i dati in qualità di responsabili del trattamento o soggetti
          autonomi, a seconda del ruolo concretamente ricoperto.
        </p>

        <h2 style={h2Style}>9. Strumenti e servizi richiamati dal sito</h2>
        <p style={pStyle}>
          Il sito può includere collegamenti o integrazioni verso servizi esterni, come ad esempio:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>WhatsApp, per il contatto diretto dell’utente;</li>
          <li style={liStyle}>servizi di posta elettronica;</li>
          <li style={liStyle}>eventuali mappe, video o contenuti incorporati di terze parti;</li>
          <li style={liStyle}>strumenti tecnici necessari alla gestione delle richieste inviate dal sito.</li>
        </ul>
        <p style={pStyle}>
          L’interazione con tali servizi può comportare trattamenti disciplinati anche dalle rispettive
          informative privacy dei relativi fornitori.
        </p>

        <h2 style={h2Style}>10. Conservazione dei dati</h2>
        <p style={pStyle}>
          I dati personali sono conservati per il tempo strettamente necessario al perseguimento
          delle finalità per cui sono stati raccolti.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            i dati inviati tramite moduli di contatto o richiesta preventivo possono essere conservati
            fino a <strong>24 mesi</strong>, salvo necessità ulteriori legate a rapporti precontrattuali,
            contrattuali o obblighi di legge;
          </li>
          <li style={liStyle}>
            i dati tecnici di navigazione sono conservati per il tempo strettamente necessario
            al funzionamento, alla sicurezza e alla manutenzione del sito.
          </li>
        </ul>

        <h2 style={h2Style}>11. Trasferimento dei dati</h2>
        <p style={pStyle}>
          I dati sono trattati principalmente all’interno dello Spazio Economico Europeo.
          Qualora, per esigenze tecniche o di servizio, alcuni trattamenti comportassero
          il trasferimento verso Paesi terzi, ciò avverrà nel rispetto delle garanzie previste
          dalla normativa applicabile.
        </p>

        <h2 style={h2Style}>12. Diritti dell’interessato</h2>
        <p style={pStyle}>
          L’utente, in qualità di interessato, può esercitare i diritti previsti dagli articoli
          15 e seguenti del GDPR, tra cui:
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>ottenere conferma dell’esistenza o meno di dati personali che lo riguardano;</li>
          <li style={liStyle}>accedere ai propri dati personali;</li>
          <li style={liStyle}>chiedere la rettifica o l’aggiornamento dei dati;</li>
          <li style={liStyle}>richiedere la cancellazione dei dati nei casi previsti;</li>
          <li style={liStyle}>richiedere la limitazione del trattamento;</li>
          <li style={liStyle}>opporsi al trattamento, nei casi previsti dalla legge;</li>
          <li style={liStyle}>richiedere la portabilità dei dati, ove applicabile;</li>
          <li style={liStyle}>revocare l’eventuale consenso prestato, senza pregiudicare i trattamenti già effettuati.</li>
        </ul>

        <h2 style={h2Style}>13. Reclamo all’autorità di controllo</h2>
        <p style={pStyle}>
          L’interessato ha il diritto di proporre reclamo all’Autorità Garante per la protezione
          dei dati personali, qualora ritenga che il trattamento dei suoi dati avvenga in violazione
          della normativa vigente.
        </p>

        <h2 style={h2Style}>14. Contatti per l’esercizio dei diritti</h2>
        <p style={pStyle}>
          Per ogni richiesta relativa al trattamento dei dati personali o per esercitare i propri diritti,
          è possibile contattare il Titolare ai seguenti recapiti:
          <br />
          <strong>Email:</strong> clthermoservice@virgilio.it
          <br />
          <strong>Telefono:</strong> 091406911
        </p>

        <h2 style={h2Style}>15. Aggiornamenti della presente informativa</h2>
        <p style={pStyle}>
          La presente Privacy Policy può essere soggetta a modifiche o aggiornamenti.
          Gli utenti sono invitati a consultare periodicamente questa pagina.
        </p>
      </div>
    </section>
  );
}