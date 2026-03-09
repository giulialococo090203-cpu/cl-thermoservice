export default function CookiePolicy() {
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
        <h1 style={h1Style}>Cookie Policy</h1>

        <p style={{ ...pStyle, marginTop: 20 }}>
          Questa Cookie Policy descrive l’uso di cookie e strumenti tecnici equivalenti
          da parte del sito web di CL. Thermoservice S.r.l.
        </p>

        <h2 style={h2Style}>1. Cosa sono i cookie</h2>
        <p style={pStyle}>
          I cookie sono piccoli file di testo che i siti visitati inviano al dispositivo
          dell’utente per migliorare il funzionamento del servizio, memorizzare preferenze
          o raccogliere informazioni sull’utilizzo del sito.
        </p>

        <h2 style={h2Style}>2. Cookie utilizzati dal sito</h2>
        <p style={pStyle}>
          Il sito utilizza principalmente cookie o strumenti tecnici necessari al corretto
          funzionamento delle pagine e al salvataggio delle preferenze relative alla gestione
          dei cookie.
        </p>

        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Cookie necessari:</strong> indispensabili al funzionamento del sito.
          </li>
          <li style={liStyle}>
            <strong>Cookie statistici:</strong> attivabili solo previo consenso, se presenti.
          </li>
          <li style={liStyle}>
            <strong>Cookie marketing:</strong> attivabili solo previo consenso, se presenti.
          </li>
        </ul>

        <h2 style={h2Style}>3. Gestione del consenso</h2>
        <p style={pStyle}>
          Alla prima visita, l’utente può scegliere se accettare tutti i cookie non necessari,
          rifiutarli oppure personalizzare le preferenze. Le preferenze possono essere modificate
          in qualsiasi momento tramite il link “Gestisci preferenze cookie” presente nel footer del sito.
        </p>

        <h2 style={h2Style}>4. Cookie di terze parti</h2>
        <p style={pStyle}>
          Eventuali contenuti o servizi di terze parti integrati nel sito, come mappe, video
          o altri strumenti esterni, possono comportare l’installazione di cookie da parte dei
          rispettivi fornitori, secondo le loro informative.
        </p>

        <h2 style={h2Style}>5. Come disabilitare i cookie dal browser</h2>
        <p style={pStyle}>
          L’utente può inoltre gestire o disabilitare i cookie tramite le impostazioni del proprio browser.
          La disabilitazione dei cookie tecnici può compromettere il corretto funzionamento del sito.
        </p>

        <h2 style={h2Style}>6. Titolare del trattamento</h2>
        <p style={pStyle}>
          CL. Thermoservice S.r.l.
          <br />
          Via Tommaso Calojra 36, Palermo
          <br />
          P.IVA 06441430821
          <br />
          Email: clthermoservice@virgilio.it
          <br />
          Tel: 091406911
        </p>

        <h2 style={h2Style}>7. Aggiornamenti</h2>
        <p style={pStyle}>
          La presente Cookie Policy può essere aggiornata nel tempo. Gli utenti sono invitati
          a consultare periodicamente questa pagina.
        </p>
      </div>
    </section>
  );
}