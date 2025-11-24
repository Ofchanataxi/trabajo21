export const obtainData = (dataToSend: any) => {
  console.log('data Send: ', dataToSend);
  const adaptiveCard = {
    type: 'AdaptiveCard',
    version: '1.3',
    body: [
      {
        type: 'TextBlock',
        text: 'Detalle de la información:',
        weight: 'Bolder',
        size: 'Large',
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Nombre del Pozo:', value: dataToSend.nameWell },
          { title: 'Equipo:', value: dataToSend.rejectedEquipment },
          {
            title: 'Fecha y Hora de Actualización:',
            value: dataToSend.updateDate,
          },
          { title: 'Por el usuario:', value: dataToSend.user },
          { title: 'Detalle:', value: dataToSend.observation },
        ],
      },
    ],
    actions: [
      {
        type: 'Action.OpenUrl',
        title: 'Ver Detalles',
        url: dataToSend.url,
      },
    ],
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
  };

  const bodyReleaseChangeState = {
    body: {
      contentType: 'html',
      content:
        'FP2P te informa<br>Actualización de información del pozo<br>Por favor revisa los detalles y asegúrate de que este todo en órden<br><attachment id="1"></attachment>', // Marcador agregado
    },
    attachments: [
      {
        id: '1', // ID único obligatorio que coincide con el marcador
        contentType: 'application/vnd.microsoft.card.adaptive',
        content: JSON.stringify(adaptiveCard), // Convierte el objeto a JSON string
      },
    ],
  };

  return bodyReleaseChangeState;
};
// `    🔔 Notificación de Actualización

//                       Estimado equipo,

//                       La información del pozo  ha sido actualizada. Por favor, revisen los detalles en la plataforma FP2P.

//                       🛠️ Detalles de la Actualización:

//                       Nombre del Pozo:  ${release.wellName}

//                       Fecha y Hora de Actualización:  ${getFormattedTimestamp()}

//                       Por el usuario:  ${release.userEmail}

//                       Para más información, accedan a la plataforma FP2P en el sigueinte enlace:

//                       ${dataReceived.urlFrom}`;
