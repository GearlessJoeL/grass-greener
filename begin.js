document.addEventListener('DOMContentLoaded', () => {
    let isAudioPlaying = true;
    let num1Count = 0;
    let num2Count = 0;
    const cubes = document.querySelectorAll('.cube');
    const distribution = document.getElementById("distributionImg");
    const ruleAudio = document.getElementById('rule');
    const values = [];
    const lables = [];

    let playerScore = 0;
    let computerScore = 0;
    let isAnimating = false;
    let clickCount = 0;

    const urlParams = new URLSearchParams(window.location.search);
    const cubeId = urlParams.get('cube');
    const selectedCube = document.getElementById(cubeId);

    const sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay));

    if (selectedCube) {
        // 模拟盒子被点击的效果
        const randomValue = getRandomVariable();
        const displayedNumber = 8;//Math.pow(2, randomValue + 1);
        toggleCube(selectedCube, displayedNumber, true, false);

        // 显示 distribution.png
        // document.getElementById('girl').style.display = 'block';

        const audioPlayer = new Audio('grass_question1.wav');
        setTimeout(() => audioPlayer.play(), 1000);
        audioPlayer.addEventListener('ended', () => {
            // 在音频结束时显示第二张图像
            const image1 = document.getElementById("girl");
            const image2 = document.getElementById('distributionImg');
            image1.style.display = 'none';
            image2.style.display = 'block';
            const hint1 = document.getElementById("hint1");
            const hint2 = document.getElementById("hint2");
            hint1.style.display = 'none';
            hint2.style.display = 'block';

            const audioPlayer2 = new Audio('grass_question2.wav');
            setTimeout(() => audioPlayer2.play(), 1000);
            audioPlayer2.addEventListener('ended', () => {
                const otherCube = document.getElementById(cubeId === 'cube1' ? 'cube2' : 'cube1');
                displayCalculation(otherCube, displayedNumber, randomValue);

                // 显示均值
                const barChart = document.getElementById('bar_chart');
                barChart.style.display = 'block';
                
                simulateClicks(otherCube, displayedNumber, 4, 996, 3000, 2);
            });
        });

        // 播放对应的音频
        //const hintAudio = document.getElementById('hintAudio');
		// hintAudio.play().catch(error => {
		//     console.error('Audio play failed:', error);
		// });
        // 获取未被点击的盒子
        
		
        // // 监听 hintAudio 播放结束事件
        // hintAudio.onended = () => {
        //     simulateClicks(otherCube, displayedNumber, 4, 996, 3000, 5);
        // };
    }

    function setNumberRotation(cube) {
        const rotateY = -parseFloat(getComputedStyle(cube).transform.match(/matrix3d\((.+)\)/)[1].split(', ')[13]) * (180 / Math.PI);
        const numElement = cube.querySelector('.number');
        numElement.style.transform = `translate(-500px, -900px) rotateY(${-rotateY}deg)`;
    }

    function toggleCube(cube, number, animate = true, display_pow = false) {
        const numElement = cube.querySelector('.number');
        console.log(display_pow);
        numElement.innerHTML = '<span class=\"red-text\"><i>X</i> = ' + number + "</span>" + (display_pow ? ('\n<i>N</i> = ' + Math.log2(number)) : '');
        //numElement.style.color = isRed ? '#FD3A3A' : '#000000';
        numElement.style.fontSize = '60px';

        if (animate) {
            numElement.classList.add('expanded', 'pop-out');
            numElement.style.display = 'block';
            setNumberRotation(cube);
            cube.querySelector('.top-left').classList.add('expanded');
            cube.querySelector('.top-right').classList.add('expanded');
            cube.classList.add('clicked');
            setTimeout(() => {
                cube.classList.remove('clicked');
            }, 3000);
        }
    }

    function toggleCube2(cube, number, animate = true, isRed = true) {
        const numElement = document.getElementById('avgtext');
        numElement.innerHTML = "均值:￥" + number.toFixed(2);
        //numElement.style.color = '#000000';
        // numElement.style.fontSize = '36px';
        //todo: barchart
        //drawChart(number);
    }

    const drawChart = () => {
        // 图表不要出现第零次
        const barChartElement = echarts.init(document.getElementById('bar_chart'));
        const len = values.length;
        const temp_val = [];
        const temp_lable = [];
        for (let i = 0; i < 3; i ++){
            if (i >= len) break;
            console.log(len, i, values[len - i - 1]);
            temp_val.unshift(values[len - i - 1]);
            temp_lable.unshift(len - i);
        }

        // console.log('ave', sum/len);
        // temp_val.push(sum/len);
        // temp_lable.push('平均值');
        var option = {
            backgroundColor: '#ffffff',
            color: ['#ff9748'],
            title: {
                text: '统计'
            },
            tooltip: {},
            legend: {
                data: ['价值']
            },
            xAxis: {
                data: temp_lable
            },
            yAxis: {},
            series: [
                {
                    name: '价值',
                    type: 'bar',
                    data: temp_val
                }
            ]
        };
        barChartElement.setOption(option);
    }

    function displayCalculation(cube, number, randomValue) {
        const numElement = cube.querySelector('.number');
        const num1 = number / 2;
        const num2 = number * 2;

        let expression = `${num1}元概率是 <i class="red-text italic-text">p</i> <br>${num2}元概率是 <span class="red-text">1 - <i>p</i></span> `;
        if (number == 2) {
            expression = `金额恒为4元`;
        }
        numElement.innerHTML = expression;
        numElement.style.display = 'block';
        numElement.style.transform = 'translate(-50%, -50%) translateY(-50px) translateZ(200px) translateX(-30px)';
        numElement.style.whiteSpace = 'nowrap';
        numElement.style.color = 'white';
        numElement.style.fontSize = '30px';
    }

    function collapseCube(cube, animate = true) {
        cube.querySelector('.top-left').classList.add('collapsing');
        cube.querySelector('.top-right').classList.add('collapsing');

        setTimeout(() => {
            cube.classList.remove('expanded');
            cube.querySelector('.top-left').classList.remove('expanded', 'collapsing');
            cube.querySelector('.top-right').classList.remove('expanded', 'collapsing');
        }, 2000);
    }

    function getRandomVariable() {
        const probability = Math.random();
        let cumulativeProbability = 0;
        let i = 1;

        while (cumulativeProbability < probability) {
            cumulativeProbability += (1 / 3) * Math.pow(2 / 3, i - 1);
            i++;
        }

        return i - 1;
    }

    function simulateClick(cube, chosenNumber, sum, times) {
        const num1 = chosenNumber / 2;
        const num2 = chosenNumber * 2;
        const y = Math.random() < 0.6 ? num1 : num2;
        values.push(y);
        sum += y;
        drawChart();
        if (y === num1) {
            num1Count++;
        } else {
            num2Count++;
        }
        console.log(`sum is: ${sum}, time is: ${times}, avg is: ${sum / times} of this simulate!`);

        toggleCube2(cube, sum / times, true, true);
        return sum;
    }

    function simulateClicks (cube, chosenNumber, count_slow, count_fast, delay_slow, delay_fast) {
        let clicks = 0;
        let sum = 0;
        const intervalId = setInterval(() => {
            clicks++;

            if (clicks === 1) {
                document.getElementById('simulation1').play();
            } else if (clicks === 2) {
                document.getElementById('simulation2').play();
            } else if (clicks === 3) {
                document.getElementById('simulation3').play();
            } else if (clicks === 4) {
                document.getElementById('simulation1000').play();
            }

            if (clicks >= count_slow) {
                clearInterval(intervalId);
                const fastIntervalId = setInterval(() => {
                    clicks++;

                    if (clicks >= count_slow + count_fast) {
                        clearInterval(fastIntervalId);
						const conclusion = document.getElementById('conclusion');
				        conclusion.style.display = 'block';
                        setTimeout(() => {
                            const conclusion_audio = new Audio("./grass_conclusion.mp3");
                            conclusion_audio.play().then(() => {
                                console.log("conclusion played");
                            }).catch((error) => {
                                console.log("audio not played: ", error);
                            });
                        }, 2000);
                        
                    }
                    sum = simulateClick(cube, chosenNumber, sum, clicks);
                }, delay_fast);
            }
            sum = simulateClick(cube, chosenNumber, sum, clicks);
        }, delay_slow);
    }
    let lastClickedCube = null;
    let isLeftCubeRed = false;

    cubes.forEach((cube, index) => {
        cube.addEventListener('click', function () {
            if (isAudioPlaying) return;

            clickCount++;
            const randomValue = getRandomVariable();
            const isZ = Math.random() < 0.5;
            const displayedNumber = isZ ? Math.pow(2, randomValue + 1) : Math.pow(2, randomValue);
            if (isZ) {
                randomValue++;
            }

            cubes.forEach((otherCube, otherIndex) => {
                const numElement = otherCube.querySelector('.number');
                numElement.style.color = '#000000';
            });

            if (lastClickedCube === this) {
                const numElement = lastClickedCube.querySelector('.number');
                numElement.style.color = isLeftCubeRed ? '#000000' : '#871717';
                isLeftCubeRed = !isLeftCubeRed;
            } else {
                const numElement = this.querySelector('.number');
                numElement.style.color = '#871717';
                isLeftCubeRed = true;
            }

            lastClickedCube = this;

            toggleCube(this, displayedNumber, true, true);
            if (displayedNumber > 2) {
                setTimeout(() => {
                    const otherCube = cubes[index === 0 ? 1 : 0];
                    displayCalculation(otherCube, displayedNumber, randomValue);

                    setTimeout(() => {
					if (clickCount === 1) {
						simulateClicks(otherCube, displayedNumber, 4, 996, 3000, 2);
					}
      //                   const hintAudio = document.getElementById('hintAudio');
      //                   // 检查用户是否在 index.html 中进行了交互
						// hintAudio.play().catch(error => {
						// 	console.error('Audio play failed:', error);
						// });
      //                   hintAudio.onended = () => {
      //                       setTimeout(() => {
      //                           setTimeout(() => {
      //                               if (clickCount === 1) {
      //                                   simulateClicks(otherCube, displayedNumber, 4, 996, 3000, 5);
      //                               }
      //                           }, 1000);
      //                       }, 2000);
      //                   };
                    }, 2000);
                }, 2000);
            } else {
                const otherCube = cubes[index === 0 ? 1 : 0];
                displayCalculation(otherCube, displayedNumber, randomValue);
                setTimeout(() => {
                    const hintAudio2 = document.getElementById('hintAudio2');
                    hintAudio2.play();
                    distribution.remove();
                }, 0);

                setTimeout(() => {
                    toggleCube2(otherCube, 4, true, false);
                }, 3000);
            }
        });
    });
});
