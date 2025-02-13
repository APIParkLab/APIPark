package ai_provider_local

import "testing"

func TestPullModel(t *testing.T) {
	p, err := PullModel("phi4", "deepseek-r1")
	if err != nil {
		t.Fatal(err)
	}
	for {
		select {
		case msg, ok := <-p.channel:
			if !ok {
				return
			}
			t.Log(msg)
		case <-p.done:
			return
		}
	}
}
