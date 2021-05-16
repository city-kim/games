<template>
  <div class="matching">
    <div
      v-show="!gameData.gameBord.isStart"
      class="game-setting"
      style="text-align:center"
    >
      <label>
        숫자 갯수 : 
        <input
          type="number"
          v-model.number="gameData.gameSetting.cardCount"
        >
      </label>
      <label>
        맞출 갯수 : 
        <input
          type="number"
          v-model.number="gameData.gameSetting.duplicateCount"
        >
      </label>
      <button
        type="button"
        @click="startGame()"
      >시작하기</button>
      <p>
        숫자갯수 10, 맞출갯수 2 -> 총 20장의 카드에서 2개의 중복숫자 맞추기<br>
        숫자갯수 20, 맞출갯수 3 -> 총 60장의 카드에서 3개의 중복숫자 맞추기
      </p>
    </div>
    <div
      v-show="gameData.gameBord.isStart"
      class="game-bord"
    >
      {{timeCounter(gameData.gameBord.time)}}
      <fieldset>
        <button
          v-show="!gameData.gameBord.hint"
          type="button"
          @click="resetGame"
        >다시하기</button>
      </fieldset>
      <div>
        <div
          v-for="(card, index) in gameData.gameSetting.cardList"
          :key="index"
          v-bind:class="{
            'active': card.isOpen,
            'done': card.isMatched,
            'lock': gameData.gameBord.hint
          }"
          @click="openCard(index, card)"
        >
          <p>
            <span v-if="card.isOpen || card.isMatched || gameData.gameBord.hint">
              {{card.value}}
            </span>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

interface gameSetting {
  cardCount: number
  matchCount: number,
  duplicateCount: number,
  cardList: any[],
  openCard: any[]
}

interface gameBord {
  time: number,
  timer: number,
  isStart: boolean,
  hint: boolean,
}

const getDefaultData = () => {
  return {
    gameSetting: {
      cardCount: 10,
      matchCount: 0,
      duplicateCount: 2,
      cardList: [],
      openCard: []
    } as gameSetting,
    gameBord: {
      time: 0,
      timer: 0,
      isStart: false,
      hint: false,
    } as gameBord
  }
}

export default defineComponent({
  data() {
    return {
      gameData: getDefaultData()
    }
  },
  methods: {
    startGame () {
      this.gameData.gameBord.isStart = true
      let cardList: object[] = []
      for (let num = 0; num < this.gameData.gameSetting.cardCount; num++) {
        let cardData = {
          value: num + 1,
          isOpen: false,
          isMatched: false
        }
        for (let dup = 0; dup < this.gameData.gameSetting.duplicateCount; dup++) {
          cardList.push(Object.assign({}, cardData))
        }
      }

      for(var i = cardList.length-1; i > 0; i--) {
        const j : number = Math.floor( Math.random() * (i + 1) )
        const x = cardList[i];
        cardList[i] = cardList[j];
        cardList[j] = x;
      }
      this.gameData.gameSetting.cardList = cardList

      this.gameData.gameBord.hint = true
      setTimeout(() => {
        this.gameData.gameBord.hint = false
        this.gameData.gameBord.timer = setInterval(() => {
          this.gameData.gameBord.time = this.gameData.gameBord.time + 10
        }, 10)
      }, 2000);

    },
    resetGame () {
      clearInterval(this.gameData.gameBord.timer)
      this.gameData = getDefaultData()
    },
    openCard (index : number, data: {isOpen: boolean,isMatched: boolean}) {
      if (!data.isMatched && !data.isOpen && !this.gameData.gameBord.hint) {
        // 오픈되지 않으면서 매치된 카드가 아니면서 힌트상태가 아닐때
        if (this.gameData.gameSetting.openCard.length < this.gameData.gameSetting.duplicateCount) {
          // 카드가 맞출갯수 미만 선택되었을때
          this.gameData.gameSetting.openCard.push({
            index: index,
            ...data
          })
          this.gameData.gameSetting.cardList[index].isOpen = true
          // 선택된 카드리스트로 보냄
          if (this.gameData.gameSetting.openCard.length > this.gameData.gameSetting.duplicateCount) {
            // 만약 카드가 맞출갯수 이상이라면 강제리셋
            this.resetCard(false)
          } else if (this.gameData.gameSetting.openCard.length === this.gameData.gameSetting.duplicateCount) {
            // 맞출갯수만큼 선택이라면 비교해주기
            this.compareCard()
            .then((res:any) => {
              this.resetCard(true)
            })
            .catch((err:any) => {
              this.resetCard(false)
            })
          }
        }
      }
    },
    closeCard (index: number) {
      this.gameData.gameSetting.cardList[index].isOpen = false
    },
    matchedCard (index: number) {
      this.gameData.gameSetting.cardList[index].isMatched = true
    },
    resetCard (isMatched: boolean) {
      setTimeout(() => {
        for (const key in this.gameData.gameSetting.openCard) {
          if (isMatched) {
            this.matchedCard(this.gameData.gameSetting.openCard[key].index)
          }
          this.closeCard(this.gameData.gameSetting.openCard[key].index)
        }
        this.gameData.gameSetting.openCard = []
      }, 500);
      if (isMatched) {
        this.gameData.gameSetting.matchCount ++
      }
      if (this.gameData.gameSetting.matchCount === this.gameData.gameSetting.cardCount) {
        clearInterval(this.gameData.gameBord.timer)
      }
    },
    compareCard (): Promise <any> {
      return new Promise((resolve,reject)=> {
        let compareArray: number[] = []
        this.gameData.gameSetting.openCard.map((x:{value: number}) => {
          compareArray.push(x.value)
        })
        if (new Set(compareArray).size === 1) {
          resolve('done')
        } else {
          reject('fail')
        }
      })
    },
    timeCounter (time: number) {
      let timeString = (time / 10).toString()
      let second = (Math.floor(time/1000)%60)
      let minute = Math.floor((time/1000)/60)
      return `${minute < 10 ? '0' : ''}${minute} : ${second < 10 ? '0' : ''}${second} : ${timeString.slice(-2)}`
    }
  }
})
</script>

<style lang="scss">
  .game-setting {
    margin-top: 1rem;
    text-align: center;
    label {
      margin-top:0.5rem;
      display:block;
    }
    button {
      width:15rem;
      margin-top:0.5rem;
    }
  }
  .game-bord {
    margin-top: 1rem;
    text-align: center;
    & > div {
      display: flex;
      flex-wrap: wrap;
      & > div {
        width: 2rem;
        padding: 1rem;
        margin: 0.25rem;
        border: 1px solid #ccc;
        cursor: pointer;
      }
    }
    p {
      height: 1rem;
    }
    div.active {
      background: #dcdcdc;
    }
    div.done {
      background: #d5ecc2;
      border:1px solid #1eae98;
      p {
        color: #1eae98;
      }
    }
    div.lock {
      cursor: default !important;
    }
    fieldset {
      height: 3rem;
      margin: 0;
      padding: 0;
      border: none;
      button {
        margin-top: 1rem;
      }
    }
  }
</style>
