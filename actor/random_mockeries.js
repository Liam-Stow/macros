// Courtesy of @Zarek
// Selected target receives a random mockery from a table called "Mockeries" along with the DC and damage.

if (!actor) {
  ui.notifications.warn("You must have an actor selected.");
  return
}

// Setup variables
let actorLevels = actor.data.data.levels || 1;
let tableName = "Mockeries";
let table = game.tables.entities.find(t => t.name == tableName);
let mockery = "Now go away or I shall taunt you a second time-a!";

// Get Targets name
const targetId = game.user.targets.ids[0];
const targetToken = canvas.tokens.get(targetId);
if (!targetToken) {
  ui.notifications.warn("You must target a token.");
  return
}
const targetName = targetToken.name;

// Roll the result, and mark it drawn
if (table) {
  if (checkTable(table)) {
    let roll = table.roll();
    let result = roll.results[0];
    mockery = result.text;
    table.updateEmbeddedEntity("TableResult", {
      _id: result._id,
      drawn: true
    });
  }
}

function checkTable(table) {
  let results = 0;
  for (let data of table.data.results) {
    if (!data.drawn) {
      results++;
    }
  }
  if (results < 1) {
    table.reset();
    ui.notifications.notify("Table Reset")
    return false
  }
  return true
}

// Add a message with damage roll
let numDie = 1;
if (actorLevels >= 17) {
  numDie = 4;
} else if (actorLevels >= 11) {
  numDie = 3;
} else if (actorLevels >= 5) {
  numDie = 2;
}

let messageContent = `<p>${targetName} Roll WIS save DC [[8+${actor.data.data.abilities.cha.mod}+@attributes.prof]] or take [[${numDie}d4]] damage and have disadvantage.</p>`
messageContent += `<p>${token.name} exclaims <b><i>"${mockery}"</i></b></p>`
messageContent += `<details closed=""><summary><a>Vicious Mockery</a></summary><p>You unleash a string of insults laced with subtle enchantments at a creature you can see within range. If the target can hear you (though it need not understand you), it must succeed on a <strong>Wisdom saving throw</strong> or take <strong>1d4 psychic damage</strong> and have <strong>disadvantage on the next attack roll</strong> it makes before the end of its next turn.</p>
  <p>This spell’s damage increases by 1d4 when you reach 5th level ([[/r 2d4]]), 11th level ([[/r 3d4]]), and 17th level ([[/r 4d4]]).</p></details>`

// create the message
if (messageContent !== '') {
  let chatData = {
    user: game.user._id,
    speaker: ChatMessage.getSpeaker(),
    content: messageContent,
  };
  ChatMessage.create(chatData, {});
}
