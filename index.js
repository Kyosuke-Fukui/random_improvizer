const soundList = [
  "C,", "^C,", "D,", "^D,", "E,", "F,", "^F,", "G,", "^G,", "A,", "^A,", "B,",
  "C", "^C", "D", "^D", "E", "F", "^F", "G", "^G", "A", "^A", "B",
  "c", "^c", "d", "^d", "e", "f", "^f", "g", "^g", "a", "^a", "b",
  "c'", "^c'", "d'", "^d'", "e'", "f'", "^f'", "g'", "^g'", "a'", "^a'", "b'"]

//コードトーン
const major = [4, 3, 4]
const minor = [3, 4, 3]
const seventh = [4, 3, 3]
const m7b5 = [3, 3, 4]
//モードスケール
const ionian = [2, 2, 1, 2, 2, 2]
const dorian = [2, 1, 2, 2, 2, 1]
const phrygian = [1, 2, 2, 2, 1, 2]
const lydian = [2, 2, 2, 1, 2, 2]
const mixolydian = [2, 2, 1, 2, 2, 1]
const aeolian = [2, 1, 2, 2, 1, 2]
const locrian = [1, 2, 2, 1, 2, 2]

const available_sound = (root, scale) => {
  let array = []
  const func = (index) => {
    if (index != -1) {
      array.push(soundList[index])
      scale.forEach((e) => {
        index += e
        if (soundList[index] != undefined) {
          array.push(soundList[index])
        }
      })
    }
  }
  let i = soundList.indexOf(root + ',')
  func(i)
  i = soundList.indexOf(root)
  func(i)
  i = soundList.indexOf(root.toLowerCase())
  func(i)
  i = soundList.indexOf(root.toLowerCase() + "'")
  func(i)

  return array
}

$('#add').on("click", () => {
  let root
  if ($('#chord').val().substr(1, 1) == "#") {
    root = '^' + $('#chord').val().substr(0, 1)
  } else {
    root = $('#chord').val().substr(0, 1)
  }
  const scale = $('#scale option:selected').val()
  let sound
  switch (scale) {
    case "major":
      sound = available_sound(root, major);
      break;
    case "minor":
      sound = available_sound(root, minor);
      break;
    case "seventh":
      sound = available_sound(root, seventh);
      break;
    case "m7b5":
      sound = available_sound(root, m7b5);
      break;
    case "ionian":
      sound = available_sound(root, ionian);
      break;
    case "dorian":
      sound = available_sound(root, dorian);
      break;
    case "phrygian":
      sound = available_sound(root, phrygian);
      break;
    case "lydian":
      sound = available_sound(root, lydian);
      break;
    case "mixolydian":
      sound = available_sound(root, mixolydian);
      break;
    case "aeolian":
      sound = available_sound(root, aeolian);
      break;
    case "locrian":
      sound = available_sound(root, locrian);
      break;
  }

  //ギターの11フレットまでで弾ける音域に限定
  const x = new Set(sound)
  const y = new Set(["C,", "^C,", "D,", "^D,", "e'", "f'", "^f'", "g'", "^g'", "a'", "^a'", "b'"])
  sound = [...new Set([...x].filter(e => (!y.has(e))))]
  console.log(sound);

  //上昇か下降かをランダムで選択
  const rnd = Math.random()
  let sound_array
  if (rnd > 0.5) {
    sound_array = combination(sound, 8)[Math.floor(Math.random() * combination(sound, 8).length)]
  } else {
    sound_array = combination(sound.slice().reverse(), 8)[Math.floor(Math.random() * combination(sound, 8).length)]
  }

  //ABC譜に追記
  $('#score').val(`${$('#score').val()}"${$('#chord').val()}"`)
  sound_array.forEach((sound) => {
    $('#score').val(`${$('#score').val()}${sound}`)
  })
  $('#score').val($('#score').val() + '|')
})

let scoreObj;

//演奏
const onMidi = (obj) => {
  if (ABCJS.synth.supportsAudio()) {
    const visualObj = ABCJS.renderAbc("notation", obj)[0];
    const synthControl = new ABCJS.synth.SynthController();
    synthControl.load("#audio", null, {
      displayRestart: true,
      displayPlay: true,
      displayProgress: true,
    });
    synthControl.setTune(visualObj, false);
  } else {
    $("#audio").html("<div class='audio-error'>ERROR!</div>")
  }
}

//記譜
const onRender = (tune, params) => {
  scoreObj = $("#score").val();
  if (!params) params = {};
  ABCJS.renderAbc("notation", tune, params);
  $("#audio").html("");

  onMidi(scoreObj)
}

//テキストファイルをダウンロード
window.addEventListener('load', () => {
  $('#save').on('click', (evt) => {
    evt.preventDefault();
    scoreObj = $("#score").val();
    const blob = new Blob([scoreObj], { type: 'text/plain' }); //{endings:'native'}は不要？
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.download = `${toLocaleString(new Date)}.txt`;
    a.href = url;
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  })

  const toLocaleString = (date) => {
    return [
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds(),
    ].join('')
  }
})

//ファイル選択後の処理
$("#selfile").change((evt) => {
  const file = evt.target.files;
  //FileReaderの作成
  const reader = new FileReader();
  //テキスト形式で読み込む
  reader.readAsText(file[0]);
  //読込終了後の処理
  reader.onload = function (ev) {
    //テキストエリアに表示する
    $('#score').val(reader.result);
  }
});

const combination = (nums, k) => {
  let ans = [];
  if (nums.length < k) {
    return []
  }
  if (k === 1) {
    for (let i = 0; i < nums.length; i++) {
      ans[i] = [nums[i]];
    }
  } else {
    for (let i = 0; i < nums.length - k + 1; i++) {
      let row = combination(nums.slice(i + 1), k - 1);
      for (let j = 0; j < row.length; j++) {
        ans.push([nums[i]].concat(row[j]));
      }
    }
  }
  return ans;
}

