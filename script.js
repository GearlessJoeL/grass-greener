document.addEventListener('DOMContentLoaded', (event) => {
    let isAudioPlaying = true;
    let num1Count = 0;
    let num2Count = 0;

    const cubes = document.querySelectorAll('.cube');
    const distribution = document.getElementById("distributionImg");
    const ruleAudio = document.getElementById('rule');

    let playerScore = 0;
    let computerScore = 0;
    let isAnimating = false;
    let clickCount = 0;




    function updateHintVisibility(show) {
        hintElement.style.visibility = show ? 'visible' : 'hidden';
    }


    function setNumberRotation(cube) {
        const rotateY = -parseFloat(getComputedStyle(cube).transform.match(/matrix3d\((.+)\)/)[1].split(', ')[13]) * (180 / Math.PI);
        cube.querySelector('.number').style.transform = `translate(-50%, -50%) rotateY(${-rotateY}deg)`;
    }

    function toggleCube(cube, number, animate = true, isRed = true) {
        const numElement = cube.querySelector('.number');
        // 添加 "元" 后缀
        numElement.textContent = "￥" + number;
        numElement.style.color = isRed ? '#871717' : '#000000'; // 设置颜色
        numElement.style.fontSize = '80px'; 


        if (animate) {
            numElement.classList.add('expanded', 'pop-out');
            numElement.style.display = 'block';
            setNumberRotation(cube);
            cube.querySelector('.top-left').classList.add('expanded');
            cube.querySelector('.top-right').classList.add('expanded');
            cube.classList.add('clicked');
            setTimeout(() => {
                // numElement.classList.remove('pop-out');
                cube.classList.remove('clicked');
            }, 3000);
        }
        
    }
    function toggleCube2(cube, number, animate = true, isRed = true) {
        const numElement = document.getElementById('avgtext');
        numElement.innerHTML = "均值:￥" + number.toFixed(2);

        numElement.style.color = '#000000'; // 设置颜色
        numElement.style.fontSize = '45px';
		
        if (animate) {
            cube.classList.add('clicked');
            setTimeout(() => {
                cube.classList.remove('clicked');
            }, 3000);
        }
    }
	
    function displayCalculation(cube, number,randomValue) {
        const numElement = cube.querySelector('.number');
        const num1 = number / 2;
        const num2 = number * 2;

        // 保存之前的文本颜色
        const prevColor = getComputedStyle(numElement).color;
		var expression = `${num1}元概率是5/8<br>${num2}元概率是3/8`;
        if(number==2){
			expression=`金额恒为4元`;
		}
		numElement.innerHTML = expression;
        numElement.style.display = 'block'; // 确保在需要时显示
        numElement.style.transform = 'translate(-50%, -50%) translateY(-50px) translateZ(200px) translateX(-50px)'; // 直接设置最终状态的样式
        numElement.style.whiteSpace = 'nowrap'; // 防止文本换行
        numElement.style.color = 'white'; // 设置文本颜色为白色
		numElement.style.fontSize='36px'

    }

    function collapseCube(cube, animate = true) {
        cube.querySelector('.top-left').classList.add('collapsing');
        cube.querySelector('.top-right').classList.add('collapsing');

        setTimeout(() => {
            cube.classList.remove('expanded');
            // cube.querySelector('.number').style.display = 'none';
            cube.querySelector('.top-left').classList.remove('expanded', 'collapsing');
            cube.querySelector('.top-right').classList.remove('expanded', 'collapsing');

        }, 2000);
    }

    function getRandomVariable() {
		//现在有事件（前n-1次抛硬币得正面，第n次得反面）发生的概率为probability，求n(向下取整)
        const probability = Math.random();
        let cumulativeProbability = 0;
        let i = 1;
    
        while (cumulativeProbability < probability) {
            cumulativeProbability += 0.4 * Math.pow(0.6, i - 1);
            i++;
        }
    
        return i-1;
    }
    

    function updateScores(displayedNumber, otherNumber) {
        playerScore += displayedNumber;
        computerScore += otherNumber;
        playerScoreElement.textContent = playerScore;
        computerScoreElement.textContent = computerScore;
    }


    function simulateClick(cube,chosedNumber,sum,times) {
        const num1 = chosedNumber/2;
        const num2 = chosedNumber*2;
        const y = Math.random() < 0.625 ? num1 : num2;
        sum = sum+y;
        if (y === num1) {
            num1Count++;
        } else {
            num2Count++;
        }
        console.log(`sum is: ${sum}, time is: ${times}, avg is: ${sum/times} of this simulate!`);
        
        // 快速切换两个盒子的内容
        toggleCube2(cube, sum/times, true, true); 
                // 更新直方图
		drawHistogram('histogram', num1, num2, num1Count, num2Count);
		return sum;
    }

	
    function simulateClicks(cube, chosedNumber, count_slow, count_fast, delay_slow, delay_fast) {
        let clicks = 0;
        let sum = 0;
        const intervalId = setInterval(() => {
            clicks++;
    
            // 根据模拟次数播放相应的音频
            if (clicks === 1) {
                document.getElementById('simulation1').play();
            } else if (clicks === 2) {
                document.getElementById('simulation2').play();
            } else if (clicks === 3) {
                document.getElementById('simulation3').play();
            } else if (clicks === 4) {
                document.getElementById('simulation1000').play();
                // 之后的模拟不再播放simulation1000
            }
    
            if (clicks >= count_slow) {
                clearInterval(intervalId);  
                const fastIntervalId = setInterval(() => {
                    clicks++;
    
                    if (clicks >= count_slow + count_fast) {
                        clearInterval(fastIntervalId);
                        // 动画完成，启用按钮
                    }
                    sum = simulateClick(cube, chosedNumber, sum, clicks);
                }, delay_fast);
            }
            sum = simulateClick(cube, chosedNumber, sum, clicks);
        }, delay_slow);
    }
    
    function cloneStyles(sourceElement, targetElement) {
        // 获取原始数字元素的计算样式
        const styles = window.getComputedStyle(sourceElement);

        // 复制计算样式到目标元素
        for (const prop of styles) {
            targetElement.style[prop] = styles[prop];
        }
    }

    function showNumberAtPosition(number, newLeft, newTop, originalNumberElement) {
        // 获取 originalNumberElement 相对于视口的位置
        const originalRect = originalNumberElement.getBoundingClientRect();

        // 创建一个新的数字元素
        const numberElement = document.createElement('div');
        numberElement.textContent = number;

        // 复制原始数字元素的样式到新元素
        cloneStyles(originalNumberElement, numberElement);

        // 设置位置和过渡属性
        numberElement.style.position = 'fixed';
        numberElement.style.left = `${originalRect.left}px`; // 使用 originalRect.left 作为初始 left
        numberElement.style.top = `${originalRect.top}px`;   // 使用 originalRect.top 作为初始 top

        // 添加数字元素到文档中
        document.body.appendChild(numberElement);

        // 使用 requestAnimationFrame 实现平滑移动
        const animationDuration = 1000; // 动画持续时间（毫秒）
        let startTime = null;

        function animate(time) {
            if (!startTime) {
                startTime = time;
            }
            const progress = (time - startTime) / animationDuration;
            if (progress < 1) {
                const currentLeft = originalRect.left + (newLeft - originalRect.left) * progress;
                const currentTop = originalRect.top + (newTop - originalRect.top) * progress;
                numberElement.style.left = `${currentLeft}px`;
                numberElement.style.top = `${currentTop}px`;
                requestAnimationFrame(animate);
            }
        }
        // 设置显示时间为0.5秒（500毫秒）后清除数字元素
        setTimeout(() => {
            document.body.removeChild(numberElement); // 移除数字元素
        }, 1500);
        requestAnimationFrame(animate);
    }
    function drawHistogram(canvasId, num1, num2, num1Count, num2Count) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        const barHeight = canvas.height / 4; // 每个条形的高度
        const maxCount = Math.max(num1Count, num2Count);
        const widthScale = canvas.width / (maxCount || 1); // 计算宽度比例
        const maxBarWidth = canvas.width * 0.8; // 设置最大条形宽度为画布宽度的 80%
    
        // 计算条形宽度，确保不超过最大宽度
        const num1Width = Math.min(num1Count * widthScale, maxBarWidth);
        const num2Width = Math.min(num2Count * widthScale, maxBarWidth);
    
        // 绘制 num1 的条形
        ctx.fillStyle = '#453123';
        ctx.fillRect(0, barHeight * 1, num1Width, barHeight);
    
        // 绘制 num2 的条形
        ctx.fillStyle = 'rgb(196,156,112)';
        ctx.fillRect(0, barHeight * 3, num2Width, barHeight);
    
        // 添加文字，根据条形宽度调整位置
        ctx.font = '18px Arial';
        ctx.fillStyle = 'white';
        ctx.fillText(`￥${num1}: ${num1Count}`, num1Width - 50, barHeight * 1.5);
        ctx.fillText(`￥${num2}: ${num2Count}`, num2Width - 50, barHeight * 3.5);
    }
    

    // 在点击事件处理程序中为每个盒子创建数字元素
    let lastClickedCube = null; // 用于跟踪上次点击的盒子
    let isLeftCubeRed = false; // 用于跟踪上次点击的盒子文字颜色



    const playRuleButton = document.getElementById('restart-button');

    let hasAudioPlayed = false;

    // 播放规则音频的事件处理程序
    playRuleButton.addEventListener('click', () => {
        if (!hasAudioPlayed) {
            ruleAudio.play();
            isAudioPlaying = true;
            hasAudioPlayed = true;
            playRuleButton.disabled = true; // 禁用按钮
            playRuleButton.style.display = 'none';
        }
    });

    // 监听音频结束事件
    ruleAudio.onended = function() {
        isAudioPlaying = false;
    };

    cubes.forEach((cube, index) => {
        cube.addEventListener('click', function () {
            if (isAudioPlaying) return; // 如果音频正在播放，则不响应点击

            clickCount++;
			var randomValue = getRandomVariable();
            const isZ = Math.random() < 0.5; // 有50%的几率选中z
            const displayedNumber = isZ ? Math.pow(2, randomValue + 1) : Math.pow(2, randomValue);
            if (isZ) {
                randomValue++; // 如果选择的是z，则randomValue增加1
            }
            
            // 将两个方块的文本颜色都重置为黑色
            cubes.forEach((otherCube, otherIndex) => {
                const numElement = otherCube.querySelector('.number');
                numElement.style.color = '#000000';
            });

            // 检查是否连续点击同一方块
            if (lastClickedCube === this) {
                const numElement = lastClickedCube.querySelector('.number');
                numElement.style.color = isLeftCubeRed ? '#000000' : '#871717'; // 根据上一次点击的方块确定颜色
                isLeftCubeRed = !isLeftCubeRed; // 切换颜色
            } else {
                // 非连续点击，将当前方块文字设为红色
                const numElement = this.querySelector('.number');
                numElement.style.color = '#871717';
                isLeftCubeRed = true; // 设置为红色
            }

            lastClickedCube = this;

            toggleCube(this, displayedNumber,true,true);
			if(displayedNumber>2){
                setTimeout(() => {
                    const otherCube = cubes[index === 0 ? 1 : 0];
                    const numElement = this.querySelector('.number');

                    displayCalculation(otherCube, displayedNumber, randomValue);

                    setTimeout(() => {
                        const hintAudio = document.getElementById('hintAudio');
                        hintAudio.play();
                        setTimeout(() => {
                            // 播放音频
							document.getElementById('bar_chart').style.display = 'block';
							distribution.remove();
							drawHistogram('histogram', displayedNumber / 2, displayedNumber * 2, num1Count, num2Count);

                            isAnimating = false;
                            setTimeout(() => {
                            if (clickCount === 1) {
                                simulateClicks(otherCube,displayedNumber,4,996,3000,5);
    
                            }
                            }, 1000);
                        }, 2000);
                    }, 2000);
                }, 2000);
            }else{
                // 在另一个盒子上显示"模拟平均：￥4"
                const otherCube = cubes[index === 0 ? 1 : 0];
				displayCalculation(otherCube, displayedNumber, randomValue);
                setTimeout(() => {
					const hintAudio2 = document.getElementById('hintAudio2');
					hintAudio2.play();
					distribution.remove();
					// document.getElementById('bar_chart').style.display = 'block';
					// drawHistogram('histogram', displayedNumber / 2, displayedNumber * 2, num1Count, num2Count);
                }, 0);
				
                setTimeout(() => {
                    toggleCube2(otherCube, 4, true, false); // 假设toggleCube2用于显示"模拟平均"
                }, 3000);
                // 更新提示信息
            }
            
        });
    });



});
